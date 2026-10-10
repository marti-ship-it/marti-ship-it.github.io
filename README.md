# Martin Omondi — Portfolio (v2)

TypeScript + Vite rebuild of the original static portfolio. Same design and
content as the hand-written HTML/CSS version, now with a real toolchain:
bundled, minified, type-checked, linted, PWA-ready, and with a contact form
that actually delivers messages.

## Stack

| Piece                 | What it replaced        | Why                                                                       |
| --------------------- | ----------------------- | ------------------------------------------------------------------------- |
| **Vite**              | none (was static files) | Dev server with HMR, hashed production bundles, CSS minification          |
| **TypeScript**        | `script.js`             | Typed feature modules under `src/modules/`                                |
| **ESLint + Prettier** | none                    | Enforces consistent, error-free code                                      |
| **PWA**               | none                    | Installable app + offline shell via `vite-plugin-pwa`                     |
| **Form delivery**     | dead demo form          | POSTs to Formspree (or any JSON form service) via `VITE_CONTACT_ENDPOINT` |

## Quick start

```bash
npm install        # once
npm run dev        # dev server on http://localhost:5173 (opens automatically)
npm run build      # typecheck + production build → dist/
npm run preview    # serve the built dist/ locally
```

## Commands

| Script              | Purpose                                 |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Vite dev server with hot reload         |
| `npm run build`     | Type-check then build to `dist/`        |
| `npm run preview`   | Serve the built bundle                  |
| `npm run typecheck` | Compile-time check (no emit)            |
| `npm run lint`      | ESLint over `src/`                      |
| `npm run format`    | Prettier write over the repo            |
| `npm run icons`     | Regenerate PWA icons from `favicon.svg` |

## Wiring up the contact form (15 minutes)

1. Create a free form at <https://formspree.io> — your submissions land in your
   inbox.
2. Copy `.env.example` to `.env`:

   ```bash
   copy .env.example .env     # PowerShell
   ```

3. Set the endpoint:

   ```ini
   VITE_CONTACT_ENDPOINT=https://formspree.io/f/your_form_id
   VITE_SITE_URL=https://your-domain.com
   ```

4. Run `npm run dev` and send yourself a test message. The form now:
   - validates on blur and submit (same rules as before),
   - includes a hidden honeypot field for spam protection,
   - shows a spinner while in flight, and reports success/failure,
   - never silently drops a message — without an endpoint it warns in the
     console and shows an in-page "not configured" notice.

Any service that accepts a JSON POST and returns 2xx works — swap Formspree for
EmailJS, Basin, Getform, your own API, etc. No markup changes needed.

## Deploying

### Netlify / Vercel (recommended)

- Build command: `npm run build`
- Output: `dist`
- Set `VITE_CONTACT_ENDPOINT` and `VITE_SITE_URL` as environment variables.

### GitHub Pages (recommended — one-click deploy)

There's a ready-made pipeline at `.github/workflows/deploy.yml` that runs
`npm run lint` + `npm run build` and publishes `dist/` to GitHub Pages on every
push to `main`. It sets `BASE_PATH` automatically, so it handles both a
**user site** (`marti-ship-it.github.io`) and a **project site**
(`marti-ship-it.github.io/<repo>/`).

Getting it live:

1. Create a repository on GitHub. For the portfolio at the domain root, name
   it exactly `marti-ship-it.github.io`; otherwise pick any name for a project
   site.
2. Push this project (`git remote add origin <repo-url>` then `git push -u
origin main`).
3. In the repo: **Settings → Pages → Build and deployment → Source: GitHub
   Actions** (the workflow handles the rest).
4. Add the contact form secret so delivery works in production:
   **Settings → Secrets and variables → Actions → New repository secret** →
   name `VITE_CONTACT_ENDPOINT`, value your Formspree URL.
5. The first run may take ~1–2 minutes; your site is then live and kept in
   sync on every push.

Before going live, update `public/sitemap.xml` and `public/robots.txt` with
the real URLs.

## Project layout

```
├── index.html            # entry — markup, SEO + JSON-LD, PWA metas
├── src/
│   ├── main.ts           # bootstraps the feature modules
│   ├── modules/
│   │   ├── dom.ts        # typed query helpers
│   │   ├── motion.ts     # shared reduced-motion handling
│   │   ├── nav.ts        # mobile menu, sticky nav, active underline
│   │   ├── smooth-scroll.ts
│   │   ├── typing.ts     # hero role typing effect
│   │   ├── pointer.ts    # fine-pointer parallax on cards
│   │   ├── reveals.ts    # scroll reveals + active-section tracking
│   │   └── form.ts       # validation + endpoint delivery
│   ├── styles/styles.css # the original art-directed stylesheet
│   └── vite-env.d.ts
├── public/               # copied verbatim into dist/
│   ├── images/           # portrait photos
│   ├── CISCO Certificates/  # certificate PDFs
│   ├── favicon*
│   └── pwa-*-*.png       # generated app icons
├── scripts/generate-icons.mjs
├── vite.config.ts        # build, base path, PWA manifest + workbox
└── typescript + eslint/prettier configs
```

## Accessibility, same as before

Skip link, visible focus rings, `aria-*` state on toggle/menu/form, reduced
motion respected everywhere (including live preference changes), and every
interactive element reachable by keyboard.
