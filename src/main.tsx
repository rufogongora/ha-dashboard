import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { HaProvider } from "./ha/HaProvider";
import { ConfigProvider } from "./config/ConfigProvider";

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
