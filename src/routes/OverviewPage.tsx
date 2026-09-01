// routes/OverviewPage.tsx
import { useSeoHead } from "@/composables/useSeoHead";

export default function OverviewPage() {
  useSeoHead({
    title: "Tableau de bord",
    subtitle: "Visualisez vos données de façon claire et concise",
    forcePrefix: true,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-title-50 mb-4">Tableau de bord</h1>
      <p className="text-text-100">
        Bienvenue dans l'interface de monitoring et de gestion des flux monétiques.
      </p>
      {/* Ajoutez ici vos widgets ou composants de dashboard */}
    </div>
  );
}