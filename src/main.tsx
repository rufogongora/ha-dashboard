import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/plus-jakarta-sans";
import "./index.css";
import App from "./App.tsx";
import { HaProvider } from "./ha/HaProvider";
import { ConfigProvider } from "./config/ConfigProvider";

// Production only: in dev the worker would cache vite's modules and fight HMR.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
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
