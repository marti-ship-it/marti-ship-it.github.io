/**
 * Motion preference tracking.
 *
 * One shared MediaQueryList so every module agrees on whether the visitor
 * has asked for reduced motion, and can react if they change their mind.
 */

export const reducedMotionQuery: MediaQueryList = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

export function prefersReducedMotion(): boolean {
  return reducedMotionQuery.matches;
}

/** Called once immediately, then again whenever the preference flips. */
export function onReducedMotionChange(callback: (reduced: boolean) => void): void {
  reducedMotionQuery.addEventListener("change", (event) => {
    callback(event.matches);
  });
}
