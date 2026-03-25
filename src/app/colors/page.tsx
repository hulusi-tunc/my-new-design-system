"use client";

import { useState } from "react";
import { colors, semanticColors, getSemanticTokens } from "@/styles/design-tokens";
import { useTheme } from "@/components/providers/theme-provider";
import { useRole } from "@/components/providers/role-provider";
import { DesignTip } from "@/components/ui/design-tip";

const shades = [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const paletteSections = [
  {
    id: "primary",
    title: "Primary",
    keys: ["gray", "brand", "error", "warning", "success"] as const,
  },
  {
    id: "neutrals",
    title: "Neutral variants",
    keys: [
      "grayBlue", "grayCool", "grayModern", "grayNeutral",
      "grayIron", "grayTrue", "grayWarm",
    ] as const,
  },
  {
    id: "palette",
    title: "Extended palette",
    keys: [
      "moss", "greenLight", "green", "teal", "cyan",
      "blueLight", "blue", "blueDark", "indigo", "violet",
      "purple", "fuchsia", "pink", "rose",
      "orangeDark", "orange", "yellow",
    ] as const,
  },
];

function camelToLabel(name: string) {
  return name.replace(/([A-Z])/g, " $1").trim();
}

function isDark(hex: string) {
  if (hex.length > 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 < 128;
}

function TokenRow({
  name,
  hex,
  onCopy,
}: {
  name: string;
  hex: string;
  onCopy: (hex: string, label: string) => void;
}) {
  return (
    <button
      onClick={() => onCopy(hex, name)}
      className="group flex items-center gap-3 py-1.5 px-2 -mx-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer w-full text-left"
    >
      <div
        className="w-7 h-7 rounded border border-black/[0.06] dark:border-white/[0.1] shrink-0"
        style={{ backgroundColor: hex }}
      />
      <span className="text-[12px] font-mono text-neutral-700 dark:text-neutral-300 flex-1 truncate">
        {name}
      </span>
      <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase">
        {hex}
      </span>
    </button>
  );
}

export default function ColorsPage() {
  const { theme, brandPalette } = useTheme();
  const { role } = useRole();
  const tokens = getSemanticTokens(theme, brandPalette);
  const [toast, setToast] = useState("");

  function copy(hex: string, label: string) {
    navigator.clipboard.writeText(hex);
    setToast(label);
    setTimeout(() => setToast(""), 1400);
  }

  return (
    <div className="px-10 py-14 max-w-6xl">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Colors</h1>
      <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-10 max-w-lg">
        Raw palette colors and semantic tokens. Click any swatch to copy its hex value.
      </p>

      {/* ── Semantic tokens ─────────────────────────── */}
      <section id="semantic" className="mb-14">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1">
          Semantic tokens
        </h2>
        <p className="text-[12px] text-neutral-400 dark:text-neutral-500 mb-6">
          Use these instead of raw palette values — they map to specific UI roles.
        </p>

        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mb-6">
          Showing <strong className="text-neutral-600 dark:text-neutral-300">{theme} mode</strong> values. Toggle the theme to see the other mode.
        </p>

        <div className="grid grid-cols-2 gap-x-10 gap-y-8">
          {/* Text */}
          <div>
            <h3 className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Text
            </h3>
            <div>
              {Object.entries(tokens.text).map(([k, v]) => (
                <TokenRow key={k} name={`text.${k}`} hex={v} onCopy={copy} />
              ))}
            </div>
          </div>

          {/* Foreground */}
          <div>
            <h3 className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Foreground
            </h3>
            <div>
              {Object.entries(tokens.fg).map(([k, v]) => (
                <TokenRow key={k} name={`fg.${k}`} hex={v} onCopy={copy} />
              ))}
            </div>
          </div>

          {/* Background */}
          <div>
            <h3 className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Background
            </h3>
            <div>
              {Object.entries(tokens.bg).map(([k, v]) => (
                <TokenRow key={k} name={`bg.${k}`} hex={v} onCopy={copy} />
              ))}
            </div>
          </div>

          {/* Border */}
          <div>
            <h3 className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Border
            </h3>
            <div>
              {Object.entries(tokens.border).map(([k, v]) => (
                <TokenRow key={k} name={`border.${k}`} hex={v} onCopy={copy} />
              ))}
            </div>
          </div>
        </div>

        {role === "developer" ? (
          <pre className="mt-6">
            <code>{`import { getSemanticTokens } from "@/styles/design-tokens"

// Get tokens for current theme
const tokens = getSemanticTokens("light") // or "dark"

tokens.text.primary       // light: ${semanticColors.light.text.primary} → dark: ${semanticColors.dark.text.primary}
tokens.bg.brandSolid      // light: ${semanticColors.light.bg.brandSolid} → dark: ${semanticColors.dark.bg.brandSolid}
tokens.border.primary     // light: ${semanticColors.light.border.primary} → dark: ${semanticColors.dark.border.primary}
tokens.fg.errorPrimary    // light: ${semanticColors.light.fg.errorPrimary} → dark: ${semanticColors.dark.fg.errorPrimary}`}</code>
          </pre>
        ) : (
          <DesignTip>Use semantic tokens (not raw palette values) so your UI automatically adapts to light and dark mode. Prefer text.primary, bg.primary, etc.</DesignTip>
        )}
      </section>

      {/* ── Raw palette ─────────────────────────────── */}
      <div className="border-t border-neutral-100 dark:border-neutral-800 pt-10 mb-6">
        <h2 className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Raw palette</h2>
        <p className="text-[12px] text-neutral-400 dark:text-neutral-500 mb-6">
          Full primitive color scales. Prefer semantic tokens above for UI work.
        </p>
      </div>

      {paletteSections.map((section) => (
        <section key={section.id} id={section.id} className="mb-12">
          <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4">
            {section.title}
          </h2>

          <div className="space-y-3">
            {section.keys.map((name) => {
              const scale = (name === "brand" ? brandPalette : colors[name]) as Record<number, string>;
              return (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-[12px] font-medium text-neutral-500 dark:text-neutral-400 capitalize">
                    {camelToLabel(name)}
                  </span>
                  <div className="flex flex-1 gap-[3px]">
                    {shades.map((shade) => {
                      const hex = scale[shade];
                      if (!hex) return <div key={shade} className="flex-1" />;
                      const dark = isDark(hex);
                      return (
                        <button
                          key={shade}
                          onClick={() => copy(hex, `${camelToLabel(name)} ${shade}`)}
                          className="group relative flex-1 cursor-pointer"
                          title={hex}
                        >
                          <div
                            className="h-9 rounded transition-transform group-hover:scale-y-[1.35] group-hover:scale-x-[1.15] group-hover:z-10 group-hover:shadow-lg relative"
                            style={{ backgroundColor: hex }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            <span className={`text-[9px] font-mono font-medium ${dark ? "text-white" : "text-black/60"}`}>
                              {hex}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {section.id === "primary" && (
            <div className="flex items-center gap-3 mt-1">
              <span className="w-20 shrink-0" />
              <div className="flex flex-1 gap-[3px]">
                {shades.map((s) => (
                  <span key={s} className="flex-1 text-center text-[9px] text-neutral-300 dark:text-neutral-600 font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      ))}

      {/* Toast */}
      <div
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[12px] font-medium rounded-md shadow-lg transition-all duration-150 ${
          toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
        }`}
      >
        Copied — {toast}
      </div>
    </div>
  );
}
