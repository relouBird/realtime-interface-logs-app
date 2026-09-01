// routes/RawLogsPage.tsx
import { useSeoHead } from "@/composables/useSeoHead";

export default function RawLogsPage() {
  useSeoHead({
    title: "Logs bruts",
    subtitle: "Accès aux logs techniques détaillés",
    forcePrefix: true,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-title-50 mb-4">Logs bruts</h1>
      <p className="text-text-100 mb-6">
        Accès aux logs techniques détaillés du système (JSON, ISO, etc.).
      </p>
      {/* Ici viendra votre visualiseur de logs bruts */}
    </div>
  );
}
