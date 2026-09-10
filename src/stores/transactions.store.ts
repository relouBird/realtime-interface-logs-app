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
  hasMore: boolean;

  summary: TransactionSummary | null;
  newLogs: TransactionRecord[];

  selectedResponse: TransactionRecord | null;

  initialized: boolean;
  loading: boolean;

  health: RabbitHealth | null;
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
  setSelectedResponse: (record: TransactionRecord | null) => void;
};

export const useTransactionStore = create<
  TransactionStoreState & TransactionStoreActions
>((set, get) => ({
  pages: [],
  currentPage: 1,
  hasMore: false,

  summary: null,
  newLogs: [],
  selectedResponse: null,

  initialized: false,
  loading: false,

  health: null,

  getMany: async () => {
    try {
      const { initialized, loading } = get();
      if (initialized || loading) return; // déjà chargé ou en cours

      set({ loading: true });

      const service = transactionService();
      const response = await service.fetchResponses({
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
        initialized: true,
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
      });
    } catch (error) {
      console.error("Failed to fetch next raw logs:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getPreviousPage() {
    const { currentPage } = get();

    if (currentPage <= 1) {
      return;
    }

    set({
      currentPage: currentPage - 1,
    });
  },

  goToPage(page) {
    const { pages } = get();

    if (page < 1 || page > pages.length) {
      return;
    }

    set({
      currentPage: page,
    });
  },

  fetchSummary: async () => {
    try {
      const service = transactionService();
      const response = await service.fetchSummary();

      if (response.status === 200) {
        set({ summary: response.data.data });
      }
    } catch (error) {
      console.error("Failed to fetch transaction summary:", error);
    }
  },

  fetchHealth: async () => {
    try {
      const service = transactionService();
      const response: AxiosResponse<RabbitHealth> = await service.fetchHealth();

      if (response.status === 200) {
        set({ health: response.data });
      }
    } catch (error) {
      console.error("Failed to fetch rabbitmq health:", error);
      throw error;
    }
  },

  findTransaction(correlationId: string) {
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

  setSelectedResponse: (record) => set({ selectedResponse: record }),
}));
