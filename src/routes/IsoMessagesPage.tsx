// routes/IsoMessagesPage.tsx
import { useSeoHead } from "@/composables/useSeoHead";

export default function IsoMessagesPage() {
  useSeoHead({
    title: "Messages ISO",
    subtitle: "Consultez et filtrez les messages ISO 8583",
    forcePrefix: true,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-title-50 mb-4">Messages ISO</h1>
      <p className="text-text-100">
        Liste des messages ISO 8583 échangés avec le Switch Monétique.
      </p>
      {/* Ajoutez ici votre tableau ou composant de logs ISO */}
    </div>
  );
}
