/**
 * Contact form.
 *
 * Validates on blur and on submit, then — when `VITE_CONTACT_ENDPOINT` is
 * configured — POSTs the payload to a form service (Formspree by default).
 * Any endpoint that accepts a JSON POST and returns 2xx works.
 */

import { $, tagname } from "./dom";

const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT?.trim() ?? "";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REQUEST_TIMEOUT_MS = 15000;

type FieldName = "name" | "email" | "message";

interface FieldRule {
  test: (value: string) => boolean;
  message: string;
}

const RULES: Record<FieldName, FieldRule> = {
  name: {
    test: (v) => v.trim().length >= 2,
    message: "Enter your name (2 characters or more).",
  },
  email: {
    test: (v) => EMAIL_RE.test(v.trim()),
    message: "Enter a valid email address.",
  },
  message: {
    test: (v) => v.trim().length >= 10,
    message: "Tell me a little more — 10 characters or more.",
  },
};

function isFieldName(value: string): value is FieldName {
  return value === "name" || value === "email" || value === "message";
}

function errorElFor(name: FieldName): HTMLElement | null {
  return document.getElementById(`${name}-error`);
}

function validateField(field: HTMLInputElement | HTMLTextAreaElement): boolean {
  if (!isFieldName(field.name)) return true;

  const rule = RULES[field.name];
  const value = field.value;
  const ok = rule.test(value);

  field.classList.toggle("is-invalid", !ok);
  field.classList.toggle("is-valid", ok && value.trim().length > 0);
  field.setAttribute("aria-invalid", String(!ok));

  const errorEl = errorElFor(field.name);
  if (errorEl) errorEl.textContent = ok ? "" : rule.message;

  return ok;
}

function clearField(field: HTMLInputElement | HTMLTextAreaElement): void {
  field.classList.remove("is-invalid", "is-valid");
  field.setAttribute("aria-invalid", "false");
  if (isFieldName(field.name)) {
    const errorEl = errorElFor(field.name);
    if (errorEl) errorEl.textContent = "";
  }
}

/** Hidden honeypot a bot will happily fill in; Formspree discards the post. */
function addHoneypot(form: HTMLFormElement): void {
  const trap = document.createElement("input");
  trap.type = "text";
  trap.name = "_gotcha";
  trap.tabIndex = -1;
  trap.autocomplete = "off";
  trap.setAttribute("aria-hidden", "true");
  trap.style.position = "absolute";
  trap.style.left = "-5000px";
  form.appendChild(trap);
}

async function postPayload(payload: Record<string, string>): Promise<void> {
  if (!ENDPOINT) {
    throw new Error("NO_ENDPOINT");
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } finally {
    window.clearTimeout(timeout);
  }
}

export function initContactForm(): void {
  const form = $("#contact-form");
  if (!form) return;

  const formEl = form as HTMLFormElement;
  const status = $("#form-status");
  const submit = formEl.querySelector<HTMLButtonElement>('button[type="submit"]');
  const originalButtonHTML = submit?.innerHTML ?? "";

  const allFields: Array<HTMLInputElement | HTMLTextAreaElement> = [
    ...tagname<HTMLInputElement>("input", formEl),
    ...tagname<HTMLTextAreaElement>("textarea", formEl),
  ].filter((field) => isFieldName(field.name));

  addHoneypot(formEl);

  const setStatus = (kind: "success" | "error", message: string): void => {
    if (!status) return;
    status.className = `form__status is-${kind}`;
    status.textContent = message;
  };

  const setBusy = (busy: boolean): void => {
    if (!submit) return;
    submit.disabled = busy;
    submit.classList.toggle("is-loading", busy);
    submit.setAttribute("aria-busy", String(busy));
    submit.innerHTML = busy ? "Sending…" : originalButtonHTML;
  };

  for (const field of allFields) {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.classList.contains("is-invalid")) validateField(field);
    });
  }

  formEl.addEventListener("submit", (event) => {
    event.preventDefault();

    const payload: Record<string, string> = { _subject: "New message from your portfolio" };
    let firstBad: HTMLInputElement | HTMLTextAreaElement | null = null;

    for (const field of allFields) {
      payload[field.name] = field.value.trim();
      const ok = validateField(field);
      if (!ok && !firstBad) firstBad = field;
    }

    // Include the honeypot so the service can reject bot submissions
    const honeypot = formEl.querySelector<HTMLInputElement>('input[name="_gotcha"]');
    if (honeypot) payload._gotcha = honeypot.value;

    if (firstBad) {
      setStatus("error", "// transmission failed — check the highlighted fields");
      firstBad.focus();
      return;
    }

    setBusy(true);

    postPayload(payload)
      .then(() => {
        setStatus("success", "// handshake complete — message sent. I'll reply within 48h.");
        formEl.reset();
        allFields.forEach(clearField);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.message === "NO_ENDPOINT") {
          // Not configured yet — tell the owner what to do, but never drop the
          // visitor's message silently.
          console.warn(
            "[contact] No VITE_CONTACT_ENDPOINT set. Payload that would be sent:",
            payload,
          );
          setStatus("error", "// message not delivered — the form endpoint is not configured yet.");
          return;
        }
        setStatus(
          "error",
          "// transmission failed — the network dropped the packet. Please retry or email me.",
        );
      })
      .finally(() => setBusy(false));
  });
}
