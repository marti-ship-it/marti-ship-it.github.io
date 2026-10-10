/**
 * Generates the PWA icon set from public/favicon.svg.
 *
 *   - pwa-192.png          standard icon
 *   - pwa-512.png          standard icon
 *   - pwa-maskable-512.png maskable icon (logo safe-zoned inside the mask area)
 *
 * Usage:  npm run icons
 */

import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const SRC = "public/favicon.svg";
const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");

const ICONS = [
  { name: "pwa-192.png", size: 192, maskable: false },
  { name: "pwa-512.png", size: 512, maskable: false },
  { name: "pwa-maskable-512.png", size: 512, maskable: true },
];

await mkdir(OUT_DIR, { recursive: true });

for (const icon of ICONS) {
  const base = sharp(SRC, { density: 300 }).resize(icon.size, icon.size).png();

  if (icon.maskable) {
    // Scale the mark to ~60% and centre it on the navy ground so it stays
    // inside the maskable safe zone used by launchers.
    const markSize = Math.round(icon.size * 0.6);
    const mark = await sharp(SRC, { density: 300 }).resize(markSize, markSize).png().toBuffer();

    await sharp({
      create: { width: icon.size, height: icon.size, channels: 4, background: "#1c1e3a" },
    })
      .composite([{ input: mark, gravity: "center" }])
      .png()
      .toFile(path.join(OUT_DIR, icon.name));
  } else {
    await base.toFile(path.join(OUT_DIR, icon.name));
  }

  console.log(`✔ generated ${icon.name}`);
}
