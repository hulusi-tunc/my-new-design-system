/**
 * Google Fonts loader — injects a stylesheet link for a given font family
 * into `document.head` on demand, so DS previews can actually render in the
 * font each design system declares (instead of falling back to system-ui).
 *
 * Tracks loaded families in a module-level Set so we never inject the same
 * link twice, even across many cards mounting simultaneously.
 *
 * This is a CDN loader — purposely separate from the app's own `next/font`
 * pipeline, which can only load fonts known at build time. DS previews are
 * dynamic (they come from manifests in the database), so we need runtime
 * loading.
 */

const loaded = new Set<string>();

const DEFAULT_WEIGHTS = ["300", "400", "500", "600", "700"];

/** Convert "Space Grotesk" → "Space+Grotesk" for a URL path segment. */
function urlFamily(name: string): string {
  return name.trim().replace(/\s+/g, "+");
}

/**
 * Family names that are not real Google Fonts — skip them. Browsers render
 * these directly (system-ui) or fall back on their own.
 */
const GENERIC_FAMILIES = new Set([
  "system-ui",
  "sans-serif",
  "serif",
  "monospace",
  "ui-monospace",
  "inherit",
  "initial",
  "unset",
]);

/**
 * Strip quotes and take the first family from a stack like
 * `"Space Grotesk", system-ui, sans-serif` → `Space Grotesk`.
 */
export function primaryFamily(stackOrName: string): string | null {
  if (!stackOrName) return null;
  const first = stackOrName.split(",")[0]?.trim();
  if (!first) return null;
  const unquoted = first.replace(/^['"]|['"]$/g, "").trim();
  if (!unquoted) return null;
  if (GENERIC_FAMILIES.has(unquoted.toLowerCase())) return null;
  return unquoted;
}

/**
 * Inject a Google Fonts stylesheet link for `family` (e.g. "Space Grotesk")
 * if it isn't already in the document. No-ops on the server and for generic
 * family names that shouldn't be fetched from Google.
 *
 * `family` may be a bare name ("Space Grotesk") or a full stack
 * (`'"Space Grotesk", system-ui, sans-serif'`) — the first declared family
 * is what gets loaded.
 */
export function loadGoogleFont(
  family: string | undefined,
  weights: string[] = DEFAULT_WEIGHTS
): void {
  if (typeof document === "undefined") return;
  if (!family) return;

  const name = primaryFamily(family);
  if (!name) return;
  if (loaded.has(name)) return;

  // Preconnect once per origin — small perf win for the first font load.
  if (!document.querySelector('link[data-hubera-font-preconnect="1"]')) {
    const pre1 = document.createElement("link");
    pre1.rel = "preconnect";
    pre1.href = "https://fonts.googleapis.com";
    pre1.setAttribute("data-hubera-font-preconnect", "1");
    document.head.appendChild(pre1);

    const pre2 = document.createElement("link");
    pre2.rel = "preconnect";
    pre2.href = "https://fonts.gstatic.com";
    pre2.crossOrigin = "anonymous";
    pre2.setAttribute("data-hubera-font-preconnect", "1");
    document.head.appendChild(pre2);
  }

  const wghts = weights.join(";");
  const href = `https://fonts.googleapis.com/css2?family=${urlFamily(name)}:wght@${wghts}&display=swap`;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-hubera-font", name);
  // If Google Fonts doesn't have this family the request 404s silently; the
  // browser uses the rest of the stack as fallback, no user-visible error.
  document.head.appendChild(link);

  loaded.add(name);
}
