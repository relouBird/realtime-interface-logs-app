import { create } from "zustand";
import type { AxiosResponse } from "axios";
import transactionService from "@/services/transaction.service";
import type {
  TransactionRecord,
  RabbitHealth,
  TransactionSummary,
} from "@/types/transaction.type";

type TransactionDetailPage = {
  data: TransactionRecord[];
  nextCursor: string | null;
};

type TransactionStoreState = {
  pages: TransactionDetailPage[];
  currentPage: number;
  filter: boolean;
  hasMore: boolean;

  summary: TransactionSummary | null;
  newLogs: TransactionRecord[];

  selectedResponse: TransactionRecord | null;

  loading: boolean;

  health: RabbitHealth | null;

  /** true = la page 1 se rafraîchit automatiquement toutes les 10s. Passe à
   * false dès qu'on navigue au-delà de la page 1 ; revient à true seulement
   * via revealNewTransactions() (bouton "N nouvelles opérations" / refresh). */
  live: boolean;
  /** Nb de transactions financières arrivées depuis le haut de la page 1
   * actuellement affichée — calculé côté serveur, mis à jour uniquement
   * quand `live` est false (sinon la page 1 se met déjà à jour toute seule). */
  pendingNewCount: number;
};

type TransactionStoreActions = {
  getMany: () => Promise<void>;
  getOneByCorrelationId: (correlationId: string) => Promise<void>;
  getNextPage: () => Promise<void>;
  getPreviousPage: () => void;
  goToPage: (page: number) => void;

  fetchHealth: () => Promise<void>;
  fetchSummary: () => Promise<void>;

  findTransaction: (correlationId: string) => TransactionRecord | undefined;
  setFilterState: (state: boolean) => void;
  setSelectedResponse: (record: TransactionRecord | null) => void;

  /** Démarre le poll de 10s (idempotent — sûr à appeler depuis plusieurs
   * pages montées en même temps, ex: Overview + Transactions). */
  startPolling: () => void;
  /** Arrête le poll (à appeler au démontage de la page). */
  stopPolling: () => void;
  /** Réaffiche les nouvelles transactions accumulées : repasse en live,
   * revient page 1, force un refresh immédiat. */
  revealNewTransactions: () => Promise<void>;
};

// Handle d'intervalle en dehors du state Zustand — ce n'est pas une donnée
// réactive, et ça permet à startPolling/stopPolling d'être appelés depuis
// plusieurs composants montés simultanément sans dupliquer le timer.
let pollHandle: ReturnType<typeof setInterval> | null = null;
let pollInFlight = false;

const POLL_INTERVAL_MS = 10_000;

export const useTransactionStore = create<
  TransactionStoreState & TransactionStoreActions
>((set, get) => {
  async function pollTick() {
    if (pollInFlight) return; // évite un chevauchement si un tick précédent traîne
    pollInFlight = true;

    try {
      const { live, pages, filter } = get();
      const service = transactionService();

      if (live) {
        // Live : on remplace silencieusement la page 1 par les données
        // fraîches, sans passer par `loading` (pas de flash d'UI toutes les
        // 10s).
        const response = await service.fetchResponses({
          filter,
          limit: 50,
        });
        if (response.status !== 200) return;

        const raw = response.data;
        set({
          pages: [{ data: raw.data, nextCursor: raw.nextCursor }],
          currentPage: 1,
          hasMore: raw.hasMore,
          pendingNewCount: 0,
        });
        return;
      }

      // Pas en live (l'utilisateur navigue au-delà de la page 1) : on ne
      // touche plus à l'affichage, on se contente de compter combien de
      // nouvelles transactions sont arrivées depuis le haut de la page 1
      // figée.
      const top = pages[0]?.data[0];
      if (!top) return;

      const response = await service.fetchNewCount({
        afterId: top.correlationId,
        afterTimestamp: top.createdAt,
        filter,
      });

      if (response.status === 200) {
        set({ pendingNewCount: response.data.data.count });
      }
    } catch (error) {
      console.error("Transaction polling tick failed:", error);
    } finally {
      pollInFlight = false;
    }
  }

  return {
    pages: [],
    currentPage: 1,
    filter: false,
    hasMore: false,

    summary: null,
    newLogs: [],
    selectedResponse: null,

    loading: false,

    health: null,

    live: true,
    pendingNewCount: 0,

    getMany: async () => {
      try {
        const { loading } = get();
        if (loading) return; // déjà chargé ou en cours

        set({ loading: true });

        const service = transactionService();
        const response = await service.fetchResponses({
          filter: get().filter,
          limit: 50,
        });

        if (response.status !== 200) {
          return;
        }

        const responseRaw = response.data;

        const firstPage: TransactionDetailPage = {
          data: responseRaw.data,
          nextCursor: responseRaw.nextCursor,
        };

        set({
          pages: [firstPage],
          currentPage: 1,
          hasMore: responseRaw.hasMore,
          // Chargement frais = nouvelle session de suivi live.
          live: true,
          pendingNewCount: 0,
        });
      } catch (error) {
        console.error("Failed to fetch transaction responses:", error);
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    getOneByCorrelationId: async (correlationId: string) => {
      try {
        const { loading } = get();
        if (loading) return; // déjà chargé ou en cours

        set({ loading: true });

        const service = transactionService();
        const response = await service.fetchResponseById(correlationId);

        if (response.status !== 200) {
          return;
        }

        set({ selectedResponse: response.data.data });
      } catch (error) {
        console.error("Failed to fetch transaction response:", error);
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    async getNextPage() {
      const { currentPage, pages, hasMore, loading } = get();

      // Rien à charger
      if (!hasMore) {
        return;
      }

      // Évite deux requêtes simultanées
      if (loading) {
        return;
      }

      // La page actuelle
      const currentPageData = pages[currentPage - 1];

      if (!currentPageData) {
        return;
      }

      const cursor = currentPageData.nextCursor;

      if (!cursor) {
        return;
      }

      try {
        set({ loading: true });

        const service = transactionService();

        const response = await service.fetchResponses({
          cursor,
          filter: get().filter,
          limit: 50,
        });

        if (response.status !== 200) {
          return;
        }

        const responseRaw = response.data;

        const nextPage: TransactionDetailPage = {
          data: responseRaw.data,
          nextCursor: responseRaw.nextCursor,
        };

        set({
          pages: [...pages, nextPage],
          currentPage: currentPage + 1,
          hasMore: responseRaw.hasMore,
          // On quitte la page 1 : plus de rafraîchissement auto tant qu'on
          // n'a pas explicitement redemandé le live.
          live: false,
        });
      } catch (error) {
        console.error("Failed to fetch next raw logs:", error);
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    getPreviousPage() {
      const { currentPage, live } = get();

      if (currentPage <= 1) {
        return;
      }

      const target = currentPage - 1;

      set({
        currentPage: target,
        // Ne réactive jamais le live tout seul en revenant page 1 — seul
        // revealNewTransactions() le fait explicitement.
        live: target === 1 ? live : false,
      });
    },

    goToPage(page) {
      const { pages, live } = get();

      if (page < 1 || page > pages.length) {
        return;
      }

      set({
        currentPage: page,
        live: page === 1 ? live : false,
      });
    },

    fetchSummary: async () => {
      const { loading } = get();
      if (loading) return; // déjà chargé ou en cours

      set({ loading: true });

      try {
        const service = transactionService();
        const response = await service.fetchSummary();

        if (response.status === 200) {
          set({ summary: response.data.data });
        }
      } catch (error) {
        console.error("Failed to fetch transaction summary:", error);
      } finally {
        set({ loading: false });
      }
    },

    fetchHealth: async () => {
      try {
        const service = transactionService();
        const response: AxiosResponse<RabbitHealth> =
          await service.fetchHealth();

        if (response.status === 200) {
          set({ health: response.data });
        }
      } catch (error) {
        console.error("Failed to fetch rabbitmq health:", error);
        throw error;
      }
    },

    findTransaction: (correlationId: string) => {
      const { pages } = get();

      for (const page of pages) {
        const found = page.data.find(
          (transaction) => transaction.correlationId === correlationId,
        );
        if (found) {
          return found;
        }
      }
      return undefined;
    },

    setFilterState: (state) => set({ filter: state }),

    setSelectedResponse: (record) => set({ selectedResponse: record }),

    startPolling: () => {
      if (pollHandle) return; // déjà démarré ailleurs (ex: deux pages montées)
      pollHandle = setInterval(pollTick, POLL_INTERVAL_MS);
    },

    stopPolling: () => {
      if (pollHandle) {
        clearInterval(pollHandle);
        pollHandle = null;
      }
    },

    revealNewTransactions: async () => {
      set({ live: true, currentPage: 1, pendingNewCount: 0 });
      // Force un refresh immédiat plutôt que d'attendre le prochain tick de
      // 10s — sinon l'utilisateur clique et ne voit rien changer tout de
      // suite.
      await pollTick();
    },
  };
});
