// App.tsx (exemple d'intégration)
import { Sidebar } from "@/components/display/Sidebar";
import { Topbar } from "@/components/display/Topbar";
import { useTransactionStore } from "@/stores/transactions.store";
import { useEffect } from "react";
import { Outlet } from "react-router";

export function Layout() {
  const fetchHealth = useTransactionStore((state) => state.fetchHealth);
  const health = useTransactionStore((state) => state.health);

  useEffect(() => {
    try {
      fetchHealth();
    } catch (error: unknown) {
      console.log("Error :", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex h-screen bg-background-soft-10">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar health={health?.gbApi === "connected"} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
