/**
 * Smooth scrolling.
 *
 * Anchor clicks are intercepted so the target clears the sticky nav even in
 * browsers that ignore `scroll-padding-top`, and so the URL/focus stay in step
 * without a second jump.
 */

import { $ } from "./dom";
import { closeMenu } from "./nav";
import { prefersReducedMotion } from "./motion";

function offsetFor(): number {
  const nav = $("#nav");
  return nav ? nav.getBoundingClientRect().height + 16 : 16;
}

function scrollToY(y: number): void {
  window.scrollTo({ top: y, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

export function initSmoothScroll(): void {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;

    const section = document.querySelector<HTMLElement>(hash);
    if (!section) return;

    event.preventDefault();
    closeMenu();

    const top = section.getBoundingClientRect().top + window.scrollY - offsetFor();
    scrollToY(top);

    history.replaceState(null, "", hash);
    section.setAttribute("tabindex", "-1");
    section.focus({ preventScroll: true });
  });

  const toTop = $("#back-to-top");
  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
  }
}
