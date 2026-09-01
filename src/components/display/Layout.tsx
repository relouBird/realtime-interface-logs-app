// App.tsx (exemple d'intégration)
import { Sidebar } from "@/components/display/Sidebar";
import { Topbar } from "@/components/display/Topbar";
import { Outlet } from "react-router";

export function Layout() {
  return (
    <div className="flex h-screen bg-background-soft-10">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
