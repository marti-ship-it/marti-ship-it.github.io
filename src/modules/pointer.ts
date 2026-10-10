/**
 * Pointer response.
 *
 * Writes a small offset into the `--px` / `--py` custom properties, which the
 * cards compose into their existing transforms — so the parallax never fights
 * the `:hover` lift. Skipped on coarse pointers and under reduced motion.
 */

import { $, $$ } from "./dom";
import { prefersReducedMotion } from "./motion";

const MAX_STRENGTH = 5; // px

interface Target {
  el: HTMLElement;
  strength: number;
}

function collectTargets(): Target[] {
  const targets: Target[] = [];

  const heroChip = $<HTMLElement>(".hero__status");
  if (heroChip) targets.push({ el: heroChip, strength: 2.2 });

  const plates = $$<HTMLElement>(".project");
  plates.forEach((el, index) => {
    // The wide lead card gets a gentler shift than the stacked ones
    targets.push({ el, strength: index === 0 ? 3 : MAX_STRENGTH });
  });

  return targets;
}

export function initPointer(): void {
  const finePointer = window.matchMedia("(pointer: fine)");
  if (!finePointer.matches || prefersReducedMotion()) return;

  const targets = collectTargets();
  if (!targets.length) return;

  const reset = (): void => {
    for (const target of targets) {
      target.el.style.setProperty("--px", "0px");
      target.el.style.setProperty("--py", "0px");
    }
  };

  const onMove = (event: PointerEvent): void => {
    const w = window.innerWidth / 2;
    const h = window.innerHeight / 2;

    for (const target of targets) {
      const rect = target.el.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;

      // Normalise the pointer position to this element's centre, clamped -1..1
      const dx = (event.clientX - (rect.left + rect.width / 2)) / w;
      const dy = (event.clientY - (rect.top + rect.height / 2)) / h;

      const cx = Math.max(-1, Math.min(1, dx));
      const cy = Math.max(-1, Math.min(1, dy));

      target.el.style.setProperty("--px", `${(-cx * target.strength).toFixed(2)}px`);
      target.el.style.setProperty("--py", `${(-cy * target.strength).toFixed(2)}px`);
    }
  };

  let queued = false;
  let lastEvent: PointerEvent | null = null;

  const handler = (event: PointerEvent): void => {
    lastEvent = event;
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      if (lastEvent) onMove(lastEvent);
    });
  };

  document.addEventListener("pointermove", handler, { passive: true });
  document.addEventListener("pointerleave", reset);
  window.addEventListener("scroll", reset, { passive: true });

  reset();
}
