/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

/** Declared in vite.config.ts via `define` — the canonical site URL. */
declare const __SITE_URL__: string;

interface ImportMetaEnv {
  /** Formspree (or compatible) endpoint the contact form POSTs to. */
  readonly VITE_CONTACT_ENDPOINT?: string;
  /** Public site URL, used for the PWA/sitemap/OG tags. */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
