import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Same-origin /api in dev so auth cookies are first-party
    // (cross-site cookies get blocked by browsers).
    proxy: {
      "/api": {
        target: "https://login-authentication-8dbl.vercel.app",
        changeOrigin: true,
      },
    },
  },
});