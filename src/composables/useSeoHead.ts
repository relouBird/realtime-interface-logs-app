import { useNavigation } from "@/composables/useNavigation";
import { useHead, useSeoMeta } from "@unhead/react";

/**
 * Composable universel pour gérer les metas avec les bons préfixes.
 * Utilise useHead() + useSeoMeta() combinés.
 */

export function useSeoHead(options: {
  title?: string;
  subtitle?: string;
  description?: string;
  forcePrefix?: boolean;
}) {
  const { formatSeoMeta } = useNavigation();
  const { title, subtitle, description } = formatSeoMeta(options);

  const entry = useHead({
    title: title ?? "Votre titre par défaut",
    meta: [{ name: "subtitle", content: subtitle }],
  });

  entry.patch({
    title: title ?? "Votre titre par défaut",
    meta: [{ name: "subtitle", content: subtitle }],
  });

  useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description,
  });

  return { title, subtitle, description };
}
