/**
 * Scroll reveals and the active-section tracker.
 *
 * Reveals are gated on the `.js` class added in <head>, so without JavaScript
 * every element ships visible rather than blank.
 */

import { $, $$ } from "./dom";
import { setActive } from "./nav";
import { prefersReducedMotion } from "./motion";

const SECTION_IDS = ["about", "credentials", "skills", "projects", "contact"] as const;

function currentActiveId(): string | null {
  const active = $(".nav__link.is-active");
  const href = active?.getAttribute("href");
  return href ? href.replace("#", "") : null;
}

export function initReveals(): void {
  const targets = $$<HTMLElement>(".reveal");
  const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
    (el): el is HTMLElement => el !== null,
  );

  let revealObserver: IntersectionObserver | null = null;

  if ("IntersectionObserver" in window && !prefersReducedMotion()) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.revealDelay ?? 0);
          window.setTimeout(() => el.classList.add("is-visible"), delay);
          revealObserver?.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
  }

  targets.forEach((el) => {
    if (revealObserver) {
      // Cards inside a grid fade in one after another
      const siblings = el.parentElement ? $$<HTMLElement>(".reveal", el.parentElement) : [];
      const index = siblings.indexOf(el);
      el.dataset.revealDelay = String(index > 0 ? Math.min(index, 5) * 70 : 0);
      revealObserver.observe(el);
    } else {
      el.classList.add("is-visible");
    }
  });

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((section) => sectionObserver.observe(section));
  } else {
    setActive("about");
  }

  // Recalculate the underline once webfonts land and metrics settle
  if (document.fonts?.ready) {
    void document.fonts.ready.then(() => {
      const id = currentActiveId();
      if (id) setActive(id);
    });
  }
}

/** Footer copyright year. */
export function initYear(): void {
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
}
