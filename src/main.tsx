import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { ThemeProvider } from "./hooks/themeContext";
import { LayoutProvider } from "./hooks/layoutContext";
import { NPClientProvider } from "./hooks/NPClientContext";
import { Toaster } from "sonner";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NPClientProvider>
      <BrowserRouter>
        <ThemeProvider>
          <LayoutProvider>
            <Toaster position="top-right" />
            <App />
          </LayoutProvider>
        </ThemeProvider>
      </BrowserRouter>
    </NPClientProvider>
  </StrictMode>
);
