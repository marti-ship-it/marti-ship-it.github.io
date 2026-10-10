/**
 * Martin Omondi — portfolio entry point.
 *
 * Boots the small feature modules. Each is independent and no-ops when its
 * target markup is absent, so the page degrades cleanly.
 */

import { initNav } from "./modules/nav";
import { initSmoothScroll } from "./modules/smooth-scroll";
import { initTyping } from "./modules/typing";
import { initPointer } from "./modules/pointer";
import { initReveals, initYear } from "./modules/reveals";
import { initContactForm } from "./modules/form";

function boot(): void {
  try {
    initNav();
    initSmoothScroll();
    initTyping();
    initPointer();
    initReveals();
    initYear();
    initContactForm();
  } catch (error) {
    // Never leave the visitor staring at a blank page because a feature
    // module threw. Drop the .js gate so all content becomes visible.
    document.documentElement.classList.remove("js");
    console.error("[portfolio] boot failed, falling back to visible content:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
