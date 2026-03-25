"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import {
  validateBrandColor,
  isValidHex,
  PRESETS,
  DEFAULT_BRAND_HEX,
  hexToHSL,
} from "@/styles/color-utils";

const shades = [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

function isDark(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 < 128;
}

export default function CustomizePage() {
  const { brandHex, setBrandHex, resetBrand, brandPalette } = useTheme();
  const [inputValue, setInputValue] = useState(brandHex);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    setInputValue(brandHex);
  }, [brandHex]);

  function handleInput(val: string) {
    setInputValue(val);
    const normalized = val.startsWith("#") ? val : `#${val}`;
    if (isValidHex(normalized)) {
      setBrandHex(normalized);
      setWarnings(validateBrandColor(normalized));
    } else if (val.replace("#", "").length === 6) {
      setWarnings(["Invalid hex color format."]);
    } else {
      setWarnings([]);
    }
  }

  function handlePreset(hex: string) {
    setInputValue(hex);
    setBrandHex(hex);
    setWarnings(validateBrandColor(hex));
  }

  function handleReset() {
    resetBrand();
    setInputValue(DEFAULT_BRAND_HEX);
    setWarnings([]);
  }

  const { h, s, l } = hexToHSL(brandHex);
  const isDefault = brandHex === DEFAULT_BRAND_HEX;

  return (
    <div className="px-10 py-14 max-w-4xl">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        Customize
      </h1>
      <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-10 max-w-lg">
        Change the primary brand color. Pick a base color and the full 12-shade
        palette is generated automatically and applied across all components.
      </p>

      {/* ── Color input ──────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4">
          Brand color
        </h2>
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer"
              style={{ backgroundColor: brandHex }}
            />
            <input
              type="color"
              value={brandHex}
              onChange={(e) => handleInput(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
          <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <span className="pl-3 text-[13px] text-neutral-400 dark:text-neutral-500 select-none">#</span>
            <input
              value={inputValue.replace("#", "")}
              onChange={(e) => handleInput(`#${e.target.value}`)}
              maxLength={6}
              className="w-24 px-1 py-2 text-[13px] font-mono text-neutral-800 dark:text-neutral-200 bg-transparent outline-none"
              placeholder="7F56D9"
            />
          </div>
          <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
            H:{h} S:{s}% L:{l}%
          </span>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-1 mb-4">
            {warnings.map((w, i) => (
              <p key={i} className="text-[12px] text-amber-600 dark:text-amber-400">
                {w}
              </p>
            ))}
          </div>
        )}
      </section>

      {/* ── Presets ───────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4">
          Presets
        </h2>
        <div className="flex gap-4">
          {PRESETS.map((p) => (
            <button
              key={p.hex}
              onClick={() => handlePreset(p.hex)}
              className="group flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <div
                className="w-9 h-9 rounded-full transition-all"
                style={{
                  backgroundColor: p.hex,
                  boxShadow: brandHex === p.hex ? `0 0 0 2px var(--color-white, #fff), 0 0 0 4px ${p.hex}` : undefined,
                }}
              />
              <span className={`text-[11px] transition-colors ${
                brandHex === p.hex
                  ? "text-neutral-900 dark:text-neutral-100 font-medium"
                  : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"
              }`}>
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Generated palette ─────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4">
          Generated palette
        </h2>
        <div className="flex gap-[3px]">
          {shades.map((shade) => {
            const hex = brandPalette[shade];
            const dark = isDark(hex);
            return (
              <div key={shade} className="flex-1 group relative cursor-pointer">
                <div
                  className="h-12 rounded transition-transform group-hover:scale-y-[1.3] group-hover:scale-x-[1.15] group-hover:z-10 group-hover:shadow-lg"
                  style={{ backgroundColor: hex }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  <span className={`text-[9px] font-mono font-medium ${dark ? "text-white" : "text-black/60"}`}>
                    {hex}
                  </span>
                </div>
                <span className="block text-center text-[9px] text-neutral-300 dark:text-neutral-600 font-mono mt-1">
                  {shade}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Live preview ──────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4">
          Live preview
        </h2>
        <div className="border border-neutral-100 dark:border-neutral-800 rounded-lg p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="md">Primary action</Button>
            <Button variant="secondary" size="md">Secondary</Button>
            <Button variant="tertiary" size="md">Tertiary</Button>
            <Button variant="link-color" size="md">Link color</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" size="xl">Extra large</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <span style={{ color: brandPalette[600] }} className="text-[14px] font-semibold">Brand 600</span>
            <span style={{ color: brandPalette[500] }} className="text-[14px] font-medium">Brand 500</span>
            <span style={{ color: brandPalette[700] }} className="text-[14px] font-medium">Brand 700</span>
          </div>
        </div>
      </section>

      {/* ── Reset ─────────────────────────────────────── */}
      {!isDefault && (
        <section>
          <Button variant="tertiary" size="sm" onClick={handleReset}>
            Reset to default purple
          </Button>
        </section>
      )}

      {/* ── Usage ─────────────────────────────────────── */}
      <section className="pt-8 mt-8 border-t border-neutral-100 dark:border-neutral-800">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3">
          Usage
        </h2>
        <pre className="text-[12px]">
          <code>{`import { generateBrandPalette } from "@/styles/color-utils"
import { getSemanticTokens } from "@/styles/design-tokens"

// Generate a palette from any hex color
const brand = generateBrandPalette("${brandHex}")

// Get semantic tokens with custom brand
const tokens = getSemanticTokens("light", brand)

tokens.bg.brandSolid      // ${brandPalette[600]}
tokens.bg.brandSolidHover  // ${brandPalette[700]}
tokens.border.brand        // ${brandPalette[500]}`}</code>
        </pre>
      </section>
    </div>
  );
}
