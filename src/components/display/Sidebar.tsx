import { useLocation } from "react-router";

import { cn } from "@/utils/cn";
import { NAV_ITEMS } from "@/constants/display/configuration.constant";

import { SurfaceButton } from "@/components/ui/SurfaceButton";
import LogoDark from "./LogoDark";

import { useDisplayStore } from "@/stores/display.store";
import { useStore } from "zustand";

export function Sidebar() {
  const { sidebarVisibility } = useStore(useDisplayStore);

  const location = useLocation();

  const isVisible = sidebarVisibility();

  return (
    <aside
      className={cn(
        "relative h-full overflow-hidden border-r border-sidebar-border bg-sidebar-nav-default-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out",
        isVisible ? "w-60" : "w-0 border-r-0",
      )}
    >
      {" "}
      <div className="flex h-full w-60 flex-col">
        {/* Logo et titre */}{" "}
        <div className="flex items-center gap-1.5 border-b border-sidebar-border p-4">
          <LogoDark />
          <p
            className={cn(
              "whitespace-nowrap transition-all duration-200",
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-3",
            )}
          >
            <span className="block text-xl font-title font-bold text-white-100">
              Neapay
            </span>

            <span className="block pt-0.5 text-xs font-semibold text-sidebar-nav-default-text/65">
              Enterprise v2.4
            </span>
          </p>
        </div>
        {/* Navigation principale */}
        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path ?? "");

            return (
              <SurfaceButton
                key={item.path}
                linkTo={item.path ?? ""}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xs px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "text-sidebar-nav-active-text bg-sidebar-nav-active-background"
                    : "text-sidebar-nav-default-text hover:text-sidebar-nav-hover-text hover:bg-sidebar-nav-hover-background",
                )}
              >
                <div className="flex w-full items-center gap-3">
                  <Icon
                    className={cn(
                      "size-5 shrink-0",
                      isActive
                        ? "text-sidebar-nav-active-text"
                        : "text-sidebar-nav-icon",
                    )}
                  />

                  <span
                    className={cn(
                      "flex-1 whitespace-nowrap text-left transition-all duration-200",
                      isVisible
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-3 opacity-0",
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </SurfaceButton>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
