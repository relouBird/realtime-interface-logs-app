// composables/useRouteHistory.ts
import { useNavigate, useLocation } from "react-router";
import type { SeoMetaOptions } from "@/types";
import { useEffect, useRef, useState } from "react";

export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const oldRoute = useRef<string | null>(null);

  const [routeHistory, setRouteHistory] = useState<string[]>([]);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(-1);

  // Surveiller les changements de route
  useEffect(() => {
    if (oldRoute.current && location.pathname !== oldRoute.current) {
      setRouteHistory([...routeHistory, oldRoute.current]);
      setCurrentRouteIndex(routeHistory.length - 1);
      oldRoute.current = location.pathname;
    }
    console.log(
      "Route history updated:",
      routeHistory[currentRouteIndex] ?? "No previous route",
    );
  }, [currentRouteIndex, location.pathname, oldRoute, routeHistory]);

  // Récupérer la dernière route
  function getLastRoute(): string | undefined {
    if (routeHistory.length > 0) {
      return routeHistory[routeHistory.length - 1];
    }
    return undefined;
  }

  // Récupérer la route N positions avant
  function getRouteAt(index: number): string | undefined {
    const targetIndex = routeHistory.length - 1 - index;
    if (targetIndex >= 0 && targetIndex < routeHistory.length) {
      return routeHistory[targetIndex];
    }
    return undefined;
  }

  // Retourner à une route spécifique
  function goToPreviousRoute(fallback: string = "/"): void {
    const lastRoute = getLastRoute();
    if (lastRoute) {
      navigate(lastRoute);
      // Retirer de l'historique après navigation
      setRouteHistory((data) => {
        const tabCopy = [...data];
        tabCopy.pop();
        return tabCopy;
      });
    } else {
      navigate(fallback);
    }
  }

  /**
   * Helper pour formater les métadonnées SEO avec préfixes cohérents.
   *
   * - Préfixe toujours `Lekruu - ...` pour le titre.
   * - Préfixe toujours `companyName - ...` pour subtitle et description.
   * - Si `forcePrefix = false`, le helper détecte si c’est déjà préfixé.
   */
  function formatSeoMeta({
    title = null,
    subtitle = null,
    description = null,
    forcePrefix = false,
  }: SeoMetaOptions) {
    const brandName = "Live Logger";

    // --- Helpers internes
    const hasPrefix = (value: string, prefix: string) =>
      value?.trim().toLowerCase().startsWith(prefix.toLowerCase());

    const prefixValue = (
      value: string | null,
      prefix: string,
    ): string | null => {
      if (!value) return null;
      if (forcePrefix) return `${prefix} - ${value}`;
      return hasPrefix(value, prefix) ? value : `${prefix} - ${value}`;
    };

    // --- Construction
    const formattedTitle = title ? prefixValue(title, brandName) : brandName;
    const formattedSubtitle = subtitle
      ? prefixValue(subtitle, brandName)
      : brandName || undefined;

    const formattedDescription = description || formattedSubtitle || undefined;

    return {
      title: formattedTitle,
      subtitle: formattedSubtitle,
      description: formattedDescription,
    };
  }

  return {
    routeHistory,
    getLastRoute,
    getRouteAt,
    goToPreviousRoute,
    formatSeoMeta,
  };
}
