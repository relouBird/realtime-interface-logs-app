import { createRoot } from "react-dom/client";
import { createHead, UnheadProvider } from "@unhead/react/client";
import "./index.css";
import Build from "./App.tsx";
import { StrictMode } from "react";
import { UisfxProvider } from "@/audio/UisfxProvider.tsx";

const head = createHead();

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <UnheadProvider head={head}>
      <UisfxProvider>
        <Build />
      </UisfxProvider>
    </UnheadProvider>
  </StrictMode>,
);
