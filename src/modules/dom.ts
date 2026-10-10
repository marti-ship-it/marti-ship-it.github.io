/**
 * Small DOM helpers.
 *
 * Typed wrappers around querySelector/querySelectorAll so the rest of the
 * codebase can name the element type it expects and skip casts.
 */

export function $<T extends Element = Element>(
  selector: string,
  context: ParentNode = document,
): T | null {
  return context.querySelector<T>(selector);
}

export function $$<T extends Element = Element>(
  selector: string,
  context: ParentNode = document,
): T[] {
  return Array.from(context.querySelectorAll<T>(selector));
}

/**
 * querySelectorAll restricted to a known tag, e.g. `tagname<HTMLInputElement>("input")`.
 * `Document | Element` is used because `getElementsByTagName` is not on `ParentNode`.
 */
export function tagname<T extends Element = Element>(
  tag: string,
  context: Document | Element = document,
): T[] {
  return Array.from(context.getElementsByTagName(tag)) as unknown as T[];
}
