import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  optimizeDeps: {
    include: ["googleapis"],
  },

  build: {
    outDir: "../frontend/build",
    emptyOutDir: true,
  },

  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
    proxy: {
      "/api/": {
        target: "http://127.0.0.1:5000/api/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});