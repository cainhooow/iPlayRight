import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  envPrefix: "VITE",
  build: {
    target: "es2015",
    minify: "esbuild",
    rollupOptions: {
      output: {
        format: "umd",
        exports: "named",
        name: "iplayright",
        entryFileNames: "js/[name].[hash].js",
        chunkFileNames: "js/[name].[hash].js",
        assetFileNames: "assets/[name].[ext]",
        // manualChunks(id) {
        //   if (id.includes("node_modules")) {
        //     return id
        //       .toString()
        //       .split("node_modules/")[1]
        //       .split("/")[0]
        //       .toString();
        //   }
        //   return "vendor";
        // },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
