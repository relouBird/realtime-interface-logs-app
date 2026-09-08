import { create } from "zustand";
import logService from "@/services/logs.service";
import type { IsoLogEntry } from "@/types/isoLog.type";

type IsoMsgLogPage = {
  data: IsoLogEntry[];
  nextCursor: string | null;
};

type IsoMsgLogStoreState = {
  pages: IsoMsgLogPage[];
  currentPage: number;
  hasMore: boolean;

  newLogs: IsoLogEntry[];

  initialized: boolean;
  loading: boolean;
};

type IsoMsgLogStoreActions = {
  getMany: () => Promise<void>;
  getNextPage: () => Promise<void>;
  getPreviousPage: () => void;
  goToPage: (page: number) => void;
};

export const useIsoMsgLogStore = create<
  IsoMsgLogStoreState & IsoMsgLogStoreActions
>((set, get) => ({
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

      const response = await service.fetchIsoMsgLogs({
        limit: 50,
      });

      if (response.status !== 200) {
        return;
      }

      const responseRaw = response.data;

      const firstPage: IsoMsgLogPage = {
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
      console.error("Failed to fetch iso msg logs:", error);
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

      const response = await service.fetchIsoMsgLogs({
        cursor,
        limit: 50,
      });

      if (response.status !== 200) {
        return;
      }

      const responseRaw = response.data;

      const nextPage: IsoMsgLogPage = {
        data: responseRaw.data,
        nextCursor: responseRaw.nextCursor,
      };

      set({
        pages: [...pages, nextPage],
        currentPage: currentPage + 1,
        hasMore: responseRaw.hasMore,
      });
    } catch (error) {
      console.error("Failed to fetch next iso msg logs:", error);
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
}));
