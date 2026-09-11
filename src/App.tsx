import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { useNotificationStore } from "./stores/notification.store";
import { useStore } from "zustand/react";

// Load les composants utiles
import { Layout } from "@/components/display/Layout";
import { Toast } from "./components/ui/Toast";

// Load les pages du routage
import OverviewPage from "./routes/OverviewPage";
import TransactionsPage from "./routes/TransactionsPage";
import TransactionDetailPage from "./routes/TransactionDetailPage";
import IsoMessagesPage from "./routes/IsoMessagesPage";
import RawLogsPage from "./routes/RawLogsPage";

// Load les styles globaux
import "./App.css";
import IsoMessageDetailPage from "./routes/IsoMessageDetailPage";

function Build() {
  const { close, visible, message, color } = useStore(useNotificationStore);

  // CECI PERMET DE CHECKER S'IL Y A UNE NOTIFICATIONS ET AU BOUT D'UN
  // MOMENT LA RETIRE
  useEffect(() => {
    console.log("new-notification =>", message);
    setTimeout(() => {
      if (visible) {
        close();
      }
    }, 5000);
  }, [close, visible, message]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transactions/:reference" element={<TransactionDetailPage />} />
            <Route path="/iso-messages" element={<IsoMessagesPage />} />
            <Route path="/iso-messages/:id" element={<IsoMessageDetailPage />} />
            <Route path="/raw-logs" element={<RawLogsPage />} />
          </Route>
        </Routes>

        <div className="toast-bottom">
          {visible && (
            <div className="animate-notif">
              <Toast
                variant={color}
                onClose={close}
                message={message as string}
              />
            </div>
          )}
        </div>
      </BrowserRouter>
    </>
  );
}

export default Build;
