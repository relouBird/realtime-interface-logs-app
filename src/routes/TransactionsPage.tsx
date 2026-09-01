// routes/TransactionsPage.tsx
import { useSeoHead } from "@/composables/useSeoHead";

export default function TransactionsPage() {
  useSeoHead({
    title: "Transactions",
    subtitle: "Liste des transactions monétiques",
    forcePrefix: true,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-title-50 mb-4">Transactions</h1>
      <p className="text-text-100 mb-6">
        Liste des transactions traitées par le système monétique.
      </p>
      {/* Ici viendra votre tableau de transactions */}
    </div>
  );
}
