/**
 * Hero typing effect.
 *
 * Cycles through the three role phrases. Pauses when the tab is hidden and
 * falls back to a static, fully-visible list under reduced motion.
 */

import { $ } from "./dom";
import { onReducedMotionChange, prefersReducedMotion } from "./motion";

const el = $("#typed");
const caret = $<HTMLElement>(".caret");

const PHRASES = ["Cyber Security Specialist", "Network Designer", "Linux Administrator"] as const;

const TYPE_SPEED = 65; // ms per typed character
const DELETE_SPEED = 35; // ms per deleted character
const HOLD = 1900; // ms a completed phrase rests
const GAP = 320; // ms pause once emptied before the next phrase

let phrase = 0;
let chars = 0;
let deleting = false;
let timer: ReturnType<typeof setTimeout> | null = null;

function setCaretVisible(visible: boolean): void {
  if (caret) caret.style.visibility = visible ? "visible" : "hidden";
}

function stop(): void {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
}

function renderStatic(): void {
  stop();
  if (el) el.textContent = PHRASES.join("  ·  ");
  setCaretVisible(false);
}

function tick(): void {
  if (!el) return;

  const text = PHRASES[phrase] ?? "";

  if (!deleting) {
    chars += 1;
    el.textContent = text.slice(0, chars);

    if (chars === text.length) {
      deleting = true;
      timer = setTimeout(tick, HOLD);
      return;
    }
    timer = setTimeout(tick, TYPE_SPEED);
  } else {
    chars -= 1;
    el.textContent = text.slice(0, chars);

    if (chars === 0) {
      deleting = false;
      phrase = (phrase + 1) % PHRASES.length;
      timer = setTimeout(tick, GAP);
      return;
    }
    timer = setTimeout(tick, DELETE_SPEED);
  }

  // Hide the caret mid-word so it does not smear across the text
  if (chars % 3 === 0) setCaretVisible(chars % 6 !== 0);
}

export function initTyping(): void {
  if (!el) return;

  if (prefersReducedMotion()) {
    renderStatic();
    return;
  }

  // Don't burn cycles typing into a hidden tab
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else if (timer === null) {
      timer = setTimeout(tick, 400);
    }
  });

  onReducedMotionChange((reduced) => {
    if (reduced) {
      renderStatic();
    } else {
      stop();
      chars = 0;
      deleting = false;
      phrase = 0;
      timer = setTimeout(tick, 0);
    }
  });

  timer = setTimeout(tick, 700);
}
