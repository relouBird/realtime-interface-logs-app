// src/audio/UisfxProvider.tsx
import { useState, type ReactNode } from "react";
import { UisfxContext, type UisfxContextType, ui } from "./UisfxContext";
import { type CueName } from "uisfx";

export function UisfxProvider({ children }: { children: ReactNode }) {
  const audioContext = new AudioContext();

  const [soundsEnabled, setSoundsEnabled] = useState(true);

  const play = (cue: string) => {
    if (!soundsEnabled) return;
    ui.play(cue as CueName);
  };

  const value: UisfxContextType = {
    ui,
    lock: async () => {
      if (audioContext.state === "running") {
        await audioContext.suspend();
      }
    },
    soundsEnabled,
    setSoundsEnabled,
    play,
  };

  return (
    <UisfxContext.Provider value={value}>{children}</UisfxContext.Provider>
  );
}
