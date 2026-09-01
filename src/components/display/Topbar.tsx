// components/display/Topbar.tsx
import { useState } from "react";
import {
  RefreshCcw,
  Bell,
  PanelLeftClose,
  PanelRightClose,
} from "lucide-react";
import { Button } from "../ui/Button";
import { useDisplayStore } from "@/stores/display.store";
import { useStore } from "zustand";
import { SurfaceButton } from "../ui/SurfaceButton";
import { SearchBar } from "./SearchBar";

export function Topbar() {
  // Store
  const { sidebarVisibility, show, close } = useStore(useDisplayStore);

  // Gestionnaire d'état
  const [notifications] = useState(3);

  const handleSearch = (searchQuery: string) => {
    // Logique de recherche ici
    console.log("Recherche:", searchQuery);
  };

  return (
    <header className="relative top-0 z-50 w-full border-b border-base-200 bg-background-soft-10 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo et titre */}
        <div className="flex items-center gap-2.5">
          <SurfaceButton
            onClick={() => {
              if (sidebarVisibility()) {
                close();
              } else {
                show();
              }
            }}
            className="text-button-ghost-text"
          >
            {sidebarVisibility() ? (
              <PanelLeftClose className="size-6" />
            ) : (
              <PanelRightClose />
            )}
          </SurfaceButton>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-2">
          {/* Barre de recherche */}
          <SearchBar handleSearch={handleSearch} />

          <div className="flex items-center gap-2 border-l pl-3.5 border-card-border">
            {/* Boutons d'action */}
            <Button variant="ghost" size="xs" iconOnly>
              <RefreshCcw className="size-4" />
            </Button>

            {/* Notification */}
            <Button
              variant="ghost"
              size="xs"
              iconOnly
              className="relative grid place-items-center transition-colors focus:ring-0"
            >
              <Bell className="size-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1.5 size-2 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"></span>
              )}
            </Button>

            {/* Statut LIVE */}
            <div className="flex items-center ml-2 gap-1.5 px-3 py-1.5 rounded-xs bg-primary-500/20 text-black">
              <div className="size-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="block pt-px text-xs font-bold">LIVE</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
