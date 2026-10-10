/**
 * Navigation: mobile menu, scroll "stuck" state, and the active-section
 * underline that slides between links.
 */

import { $, $$ } from "./dom";

const nav = $("#nav");
const toggle = $<HTMLButtonElement>("#nav-toggle");
const links = $("#nav-links");
const indicator = $<HTMLElement>(".nav__indicator");
const navLinks = $$<HTMLAnchorElement>(".nav__link");

function setMenu(open: boolean): void {
  if (!links || !toggle) return;
  links.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
}

export function closeMenu(): void {
  setMenu(false);
}

/** Slide the underline under whichever link points at `id`. */
export function setActive(id: string): void {
  if (!indicator) return;

  let matched = false;

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      matched = true;
      indicator.style.width = `${link.offsetWidth}px`;
      indicator.style.transform = `translateX(${link.offsetLeft}px)`;
      indicator.classList.add("is-on");
    }
  });

  if (!matched) indicator.classList.remove("is-on");
}

export function initNav(): void {
  if (!nav) return;

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      setMenu(!open);
    });

    navLinks.forEach((link) => link.addEventListener("click", closeMenu));

    // Close on outside click
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof Node && !nav.contains(target)) closeMenu();
    });

    // Close on Escape, restoring focus to the toggle
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        closeMenu();
        toggle.focus();
      }
    });
  }

  const onScroll = (): void => {
    nav.classList.toggle("is-stuck", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}
