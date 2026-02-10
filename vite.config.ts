import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/manual-data": {
        target: "https://inago-assets.s3.us-west-1.amazonaws.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/manual-data/, ""),
      },
    }
  }
});

