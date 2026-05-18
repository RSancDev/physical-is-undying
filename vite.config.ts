import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/physical-is-undying/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "sample-collection.json", "sample-import.csv"],
      manifest: {
        name: "4K Vault",
        short_name: "4K Vault",
        description: "A local-first tracker for physical 4K Ultra HD Blu-ray releases.",
        theme_color: "#080b12",
        background_color: "#080b12",
        display: "standalone",
        start_url: "/physical-is-undying/",
        icons: [
          {
            src: "pwa-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable"
          },
          {
            src: "pwa-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,json,csv}"]
      }
    })
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.ts"
  }
});
