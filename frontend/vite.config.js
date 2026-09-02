import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During development the frontend runs on its own port and talks to the
// Express backend on port 5000. Vite proxies /api requests to that backend so
// the browser never has to call localhost directly (this also makes the
// preview work in hosted environments).
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    // Allow arbitrary preview hosts (e.g. ...e2b.app) to reach this dev server.
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      // Forward top-level short codes (e.g. /AbCdEf) to the backend so the
      // generated short link actually redirects during the live preview.
      "^/[A-Za-z0-9]{4,20}$": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
