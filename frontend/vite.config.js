import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000", // Changed from http://localhost:5000
        changeOrigin: true,
        secure: false,
      },
      /* // Temporarily comment out this rule to diagnose
      "/prompt": {
        target: "https://consensus-seven.vercel.app/",
        changeOrigin: true,
        secure: true,
      },
      */
      "/auth": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
