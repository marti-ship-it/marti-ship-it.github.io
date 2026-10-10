/// <reference types="node" />
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Vite configuration.
 *
 * `BASE_PATH` lets the same build deploy to a domain root ("/") or a
 * sub-path such as a GitHub Pages project site ("/my-repo/").
 *   PowerShell:  $env:BASE_PATH="/my-repo/"; npm run build
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.BASE_PATH || "/";
  const siteUrl = env.VITE_SITE_URL || "https://example.com/";

  return {
    base,
    publicDir: "public",
    build: {
      target: "es2020",
      outDir: "dist",
      assetsDir: "assets",
      cssMinify: "lightningcss",
      sourcemap: false,
      rollupOptions: {
        output: {
          // Keep the emitted file names predictable and cache-friendly.
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
    },
    server: {
      port: 5173,
      open: true,
    },
    preview: {
      port: 4173,
    },
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        includeAssets: ["favicon.svg", "favicon-32.png", "apple-touch-icon.png"],
        manifest: {
          name: "Martin Omondi — Cyber Security Specialist",
          short_name: "Martin.dev",
          description:
            "Cyber Security Specialist, Network Designer and Linux Administrator. Portfolio of secure LAN design, security awareness and AI workflow projects.",
          lang: "en",
          start_url: ".",
          scope: ".",
          display: "standalone",
          background_color: "#1c1e3a",
          theme_color: "#1c1e3a",
          categories: ["portfolio", "security", "technology"],
          icons: [
            { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
            { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
            {
              src: "pwa-maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
          // Certificate PDFs are large and rarely needed offline; keep them
          // out of the precache and let the network handle them.
          globIgnores: ["**/*.pdf"],
          navigateFallback: "index.html",
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === "image",
              handler: "CacheFirst",
              options: {
                cacheName: "images",
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              urlPattern: ({ url }) =>
                url.origin === "https://fonts.googleapis.com" ||
                url.origin === "https://fonts.gstatic.com",
              handler: "StaleWhileRevalidate",
              options: { cacheName: "google-fonts" },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    define: {
      __SITE_URL__: JSON.stringify(siteUrl),
    },
  };
});
