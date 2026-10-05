import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/plus-jakarta-sans";
import "./index.css";
import App from "./App.tsx";
import { HaProvider } from "./ha/HaProvider";
import { ConfigProvider } from "./config/ConfigProvider";
import { startAutoUpdate } from "./lib/autoUpdate";

// Production only: in dev the worker would cache vite's modules and fight
// HMR, and vite reloads the page on changes by itself.
if (import.meta.env.PROD) {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
  startAutoUpdate();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <HaProvider>
        <ConfigProvider>
          <App />
        </ConfigProvider>
      </HaProvider>
    </BrowserRouter>
  </StrictMode>,
);
