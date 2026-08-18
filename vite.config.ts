import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("react-router-dom")) {
            return "router";
          }

          if (id.includes("react-redux") || id.includes("@reduxjs")) {
            return "redux";
          }

          if (id.includes("firebase")) {
            return "firebase";
          }

          if (id.includes("framer-motion")) {
            return "motion";
          }

          if (id.includes("recharts")) {
            return "charts";
          }

          if (id.includes("jspdf")) {
            return "jspdf";
          }

          if (id.includes("html2canvas")) {
            return "html2canvas";
          }

          if (id.includes("axios")) {
            return "http";
          }

          const packagePath = id.split("/node_modules/").pop() ?? id;
          const [scopeOrName, nestedName] = packagePath.split("/");
          const rawPackageName =
            scopeOrName.startsWith("@") && nestedName
              ? `${scopeOrName.slice(1)}-${nestedName}`
              : scopeOrName;

          return rawPackageName.replace(/[^a-zA-Z0-9_-]/g, "-");
        },
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5174,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
      },
    },
  },
});
