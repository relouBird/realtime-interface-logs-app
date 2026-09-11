import { create } from "zustand";
import logService from "@/services/logs.service";
import type { SyncLogEntry } from "@/types/syncLog.type";

type RawLogPage = {
  data: SyncLogEntry[];
  nextCursor: string | null;
};

type RawLogStoreState = {
  pages: RawLogPage[];
  currentPage: number;
  hasMore: boolean;

  newLogs: SyncLogEntry[];

  initialized: boolean;
  loading: boolean;
};

type RawLogStoreActions = {
  getMany: () => Promise<void>;
  getNextPage: () => Promise<void>;
  getPreviousPage: () => void;
  goToPage: (page: number) => void;
};

export const useRawLogStore = create<RawLogStoreState & RawLogStoreActions>(
  (set, get) => ({
    pages: [],
    currentPage: 1,
    hasMore: true,

    newLogs: [],

    loading: false,
    initialized: false,

    async getMany() {
      try {
        const { initialized, loading } = get();
        if (initialized || loading) return; // déjà chargé ou en cours

        set({ loading: true });

        const service = logService();

        const response = await service.fetchRawLogs({
          limit: 50,
        });

        if (response.status !== 200) {
          return;
        }

        const responseRaw = response.data;

        const firstPage: RawLogPage = {
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
        console.error("Failed to fetch raw logs:", error);
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

        const service = logService();

        const response = await service.fetchRawLogs({
          cursor,
          limit: 50,
        });

        if (response.status !== 200) {
          return;
        }

        const responseRaw = response.data;

        const nextPage: RawLogPage = {
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
  }),
);
