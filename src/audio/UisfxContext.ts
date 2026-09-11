// src/audio/UisfxContext.ts
import { createContext } from "react";
import { createUISFX, type CueName } from "uisfx";

export const ui = createUISFX({
  pack: "mechanical",
});

export type UisfxContextType = {
  ui: ReturnType<typeof createUISFX>;
  lock: () => void;
  soundsEnabled: boolean;
  setSoundsEnabled: (enabled: boolean) => void;
  play: (cue: CueName) => void;
};

export const UisfxContext = createContext<UisfxContextType | null>(null);
