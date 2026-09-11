import { create } from "zustand";

type DisplayStoreState = {
  visible: boolean;
};

type DisplayStoreActions = {
  getDisplayState: () => DisplayStoreState;
  sidebarVisibility: () => boolean;
  close: () => void;
  show: () => void;
};

export const useDisplayStore = create<DisplayStoreState & DisplayStoreActions>(
  (set, get) => ({
    visible: true,

    // GETTERS
    getDisplayState: () => {
      return get();
    },
    sidebarVisibility: () => get().visible,
    // SETTERS
    close: () => set(() => ({ visible: false })),
    show: () => set(() => ({ visible: true })),
  }),
);
