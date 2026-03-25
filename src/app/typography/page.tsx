"use client";

import { useState } from "react";
import {
  fontFamily,
  fontWeights,
  typeScale,
  type TypeSize,
  type FontWeight,
} from "@/styles/design-tokens";
import { useRole } from "@/components/providers/role-provider";
import { DesignTip } from "@/components/ui/design-tip";

const displaySizes: TypeSize[] = [
  "display-2xl",
  "display-xl",
  "display-lg",
  "display-md",
  "display-sm",
  "display-xs",
];

const textSizes: TypeSize[] = [
  "text-xl",
  "text-lg",
  "text-md",
  "text-sm",
  "text-xs",
];

const weights: { label: string; value: FontWeight }[] = [
  { label: "Regular", value: "regular" },
  { label: "Medium", value: "medium" },
  { label: "Semibold", value: "semibold" },
  { label: "Bold", value: "bold" },
];

function TypeRow({ size, sampleText }: { size: TypeSize; sampleText: string }) {
  const style = typeScale[size];

  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-[12px] font-medium text-neutral-800 dark:text-neutral-200 font-mono w-24 shrink-0">
          {size}
        </span>
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
          {style.fontSize}px / {style.lineHeight}px
          {style.letterSpacing !== "0" && ` / ${style.letterSpacing}`}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {weights.map((w) => (
          <div key={w.value}>
            <p
              style={{
                fontFamily,
                fontSize: style.fontSize,
                lineHeight: `${style.lineHeight}px`,
                letterSpacing: style.letterSpacing,
                fontWeight: fontWeights[w.value],
              }}
              className="text-neutral-900 dark:text-neutral-100 truncate"
            >
              {sampleText}
            </p>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 block">
              {w.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TypographyPage() {
  const [sample, setSample] = useState("Ag");
  const { role } = useRole();

  return (
    <div className="px-10 py-14 max-w-6xl">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        Typography
      </h1>
      <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6 max-w-lg">
        The type system uses <strong className="text-neutral-700 dark:text-neutral-300">Inter</strong> with
        4 weights and 11 size steps — 6 display sizes for headings and
        5 text sizes for body content.
      </p>

      {/* Editable sample */}
      <div className="mb-10 flex items-center gap-3">
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-semibold">Preview</span>
        <input
          value={sample}
          onChange={(e) => setSample(e.target.value)}
          className="border border-neutral-200 dark:border-neutral-700 bg-transparent rounded px-2 py-1 text-[13px] text-neutral-700 dark:text-neutral-300 w-48 outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"
          placeholder="Type to preview..."
        />
      </div>

      {/* Font specimen */}
      <section className="mb-12 pb-10 border-b border-neutral-100 dark:border-neutral-800">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4">
          Font
        </h2>
        <div className="flex items-end gap-10">
          <p
            style={{ fontFamily, fontSize: 64, lineHeight: 1, fontWeight: 400 }}
            className="text-neutral-900 dark:text-neutral-100"
          >
            Ag
          </p>
          <div className="pb-2 space-y-1">
            {weights.map((w) => (
              <p
                key={w.value}
                style={{
                  fontFamily,
                  fontSize: 16,
                  fontWeight: fontWeights[w.value],
                }}
                className="text-neutral-600 dark:text-neutral-400 flex items-center gap-2"
              >
                <span className="text-neutral-900 dark:text-neutral-100">Aa</span>
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  {w.label} — {fontWeights[w.value]}
                </span>
              </p>
            ))}
          </div>
        </div>
        <p
          style={{ fontFamily, fontSize: 14, lineHeight: "24px" }}
          className="text-neutral-500 dark:text-neutral-400 mt-4"
        >
          ABCDEFGHIJKLMNOPQRSTUVWXYZ
          <br />
          abcdefghijklmnopqrstuvwxyz
          <br />
          0123456789 !@#$%^&*()
        </p>
      </section>

      {/* Display */}
      <section className="mb-12 pb-10 border-b border-neutral-100 dark:border-neutral-800">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-6">
          Display
        </h2>
        {displaySizes.map((size) => (
          <TypeRow key={size} size={size} sampleText={sample || "Ag"} />
        ))}
      </section>

      {/* Text */}
      <section className="mb-12 pb-10 border-b border-neutral-100 dark:border-neutral-800">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-6">
          Text
        </h2>
        {textSizes.map((size) => (
          <TypeRow key={size} size={size} sampleText={sample || "Ag"} />
        ))}
      </section>

      {/* Reference table */}
      <section className="mb-12 pb-10 border-b border-neutral-100 dark:border-neutral-800">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4">
          Reference
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-neutral-400 dark:text-neutral-500 border-b border-neutral-100 dark:border-neutral-800">
                <th className="py-2 pr-4 font-medium">Token</th>
                <th className="py-2 pr-4 font-medium">Size</th>
                <th className="py-2 pr-4 font-medium">Line height</th>
                <th className="py-2 pr-4 font-medium">Letter spacing</th>
              </tr>
            </thead>
            <tbody className="font-mono text-neutral-600 dark:text-neutral-400">
              {[...displaySizes, ...textSizes].map((size) => {
                const s = typeScale[size];
                return (
                  <tr key={size} className="border-b border-neutral-50 dark:border-neutral-800/50">
                    <td className="py-2 pr-4 text-neutral-800 dark:text-neutral-200">{size}</td>
                    <td className="py-2 pr-4">{s.fontSize}px</td>
                    <td className="py-2 pr-4">{s.lineHeight}px</td>
                    <td className="py-2 pr-4">
                      {s.letterSpacing === "0" ? "—" : s.letterSpacing}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Examples */}
      <section className="mb-12 pb-10 border-b border-neutral-100 dark:border-neutral-800">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-6">
          Examples
        </h2>

        {/* Hero */}
        <div className="mb-8">
          <span className="text-[12px] text-neutral-500 dark:text-neutral-400 mb-3 block">Hero section</span>
          <div className="border border-neutral-100 dark:border-neutral-800 rounded-lg p-8 mb-3">
            <p
              style={{
                fontFamily,
                fontSize: typeScale["display-xl"].fontSize,
                lineHeight: `${typeScale["display-xl"].lineHeight}px`,
                letterSpacing: typeScale["display-xl"].letterSpacing,
                fontWeight: fontWeights.semibold,
              }}
              className="text-neutral-900 dark:text-neutral-100 mb-3"
            >
              Build faster with Octopus
            </p>
            <p
              style={{
                fontFamily,
                fontSize: typeScale["text-lg"].fontSize,
                lineHeight: `${typeScale["text-lg"].lineHeight}px`,
                fontWeight: fontWeights.regular,
              }}
              className="text-neutral-500 dark:text-neutral-400 max-w-md"
            >
              A design system that keeps your team aligned from Figma to production code.
            </p>
          </div>
          {role === "developer" && (
            <pre><code>{`<h1 style={{ ...typeScale["display-xl"], fontWeight: fontWeights.semibold }}>
  Build faster with Octopus
</h1>
<p style={{ ...typeScale["text-lg"], fontWeight: fontWeights.regular }}>
  A design system that keeps your team aligned...
</p>`}</code></pre>
          )}
        </div>

        {/* Card */}
        <div className="mb-8">
          <span className="text-[12px] text-neutral-500 dark:text-neutral-400 mb-3 block">Card with mixed sizes</span>
          <div className="border border-neutral-100 dark:border-neutral-800 rounded-lg p-8 mb-3">
            <div className="max-w-sm border border-neutral-200 dark:border-neutral-700 rounded-lg p-5">
              <p
                style={{
                  fontFamily,
                  fontSize: typeScale["text-xs"].fontSize,
                  lineHeight: `${typeScale["text-xs"].lineHeight}px`,
                  fontWeight: fontWeights.medium,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
                className="text-violet-600 dark:text-violet-400 mb-1"
              >
                New feature
              </p>
              <p
                style={{
                  fontFamily,
                  fontSize: typeScale["display-xs"].fontSize,
                  lineHeight: `${typeScale["display-xs"].lineHeight}px`,
                  fontWeight: fontWeights.semibold,
                }}
                className="text-neutral-900 dark:text-neutral-100 mb-2"
              >
                Analytics dashboard
              </p>
              <p
                style={{
                  fontFamily,
                  fontSize: typeScale["text-sm"].fontSize,
                  lineHeight: `${typeScale["text-sm"].lineHeight}px`,
                  fontWeight: fontWeights.regular,
                }}
                className="text-neutral-500 dark:text-neutral-400"
              >
                Track key metrics, monitor performance, and make data-driven decisions with real-time insights.
              </p>
            </div>
          </div>
          {role === "developer" && (
            <pre><code>{`// Overline
<p style={{ ...typeScale["text-xs"], fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
  New feature
</p>
// Title
<h3 style={{ ...typeScale["display-xs"], fontWeight: 600 }}>
  Analytics dashboard
</h3>
// Body
<p style={{ ...typeScale["text-sm"], fontWeight: 400 }}>
  Track key metrics...
</p>`}</code></pre>
          )}
        </div>

        {/* Article */}
        <div className="mb-8">
          <span className="text-[12px] text-neutral-500 dark:text-neutral-400 mb-3 block">Article / long-form</span>
          <div className="border border-neutral-100 dark:border-neutral-800 rounded-lg p-8 mb-3">
            <div className="max-w-lg">
              <p
                style={{
                  fontFamily,
                  fontSize: typeScale["display-sm"].fontSize,
                  lineHeight: `${typeScale["display-sm"].lineHeight}px`,
                  fontWeight: fontWeights.semibold,
                }}
                className="text-neutral-900 dark:text-neutral-100 mb-4"
              >
                Getting started with design tokens
              </p>
              <p
                style={{
                  fontFamily,
                  fontSize: typeScale["text-md"].fontSize,
                  lineHeight: `${typeScale["text-md"].lineHeight}px`,
                  fontWeight: fontWeights.regular,
                }}
                className="text-neutral-600 dark:text-neutral-400 mb-4"
              >
                Design tokens are the smallest pieces of a design system — colors, typography, spacing, and more stored as reusable variables. They bridge the gap between design and code.
              </p>
              <p
                style={{
                  fontFamily,
                  fontSize: typeScale["display-xs"].fontSize,
                  lineHeight: `${typeScale["display-xs"].lineHeight}px`,
                  fontWeight: fontWeights.medium,
                }}
                className="text-neutral-900 dark:text-neutral-100 mb-2"
              >
                Why tokens?
              </p>
              <p
                style={{
                  fontFamily,
                  fontSize: typeScale["text-md"].fontSize,
                  lineHeight: `${typeScale["text-md"].lineHeight}px`,
                  fontWeight: fontWeights.regular,
                }}
                className="text-neutral-600 dark:text-neutral-400"
              >
                When a designer updates a color in Figma, the same value can flow into your codebase automatically. No more hardcoded hex values scattered across components.
              </p>
            </div>
          </div>
          {role === "developer" && (
            <pre><code>{`// Page heading: display-sm / semibold
// Section heading: display-xs / medium
// Body: text-md / regular`}</code></pre>
          )}
        </div>

        {/* Metric */}
        <div>
          <span className="text-[12px] text-neutral-500 dark:text-neutral-400 mb-3 block">Stats / metrics</span>
          <div className="border border-neutral-100 dark:border-neutral-800 rounded-lg p-8 mb-3">
            <div className="flex gap-10">
              {[
                { label: "Users", value: "12,847" },
                { label: "Revenue", value: "$48.2K" },
                { label: "Conversion", value: "3.6%" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p
                    style={{
                      fontFamily,
                      fontSize: typeScale["display-md"].fontSize,
                      lineHeight: `${typeScale["display-md"].lineHeight}px`,
                      letterSpacing: typeScale["display-md"].letterSpacing,
                      fontWeight: fontWeights.semibold,
                    }}
                    className="text-neutral-900 dark:text-neutral-100"
                  >
                    {stat.value}
                  </p>
                  <p
                    style={{
                      fontFamily,
                      fontSize: typeScale["text-sm"].fontSize,
                      lineHeight: `${typeScale["text-sm"].lineHeight}px`,
                      fontWeight: fontWeights.medium,
                    }}
                    className="text-neutral-500 dark:text-neutral-400 mt-1"
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {role === "developer" && (
            <pre><code>{`// Big number: display-md / semibold
// Label: text-sm / medium`}</code></pre>
          )}
        </div>
      </section>

      {/* Usage */}
      <section>
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3">
          Usage
        </h2>
        {role === "developer" ? (
          <pre>
            <code>{`import { typeScale, fontWeights, fontFamily } from "@/styles/design-tokens"

// Inline style
<h1 style={{
  fontFamily,
  fontSize: typeScale["display-lg"].fontSize,
  lineHeight: \`\${typeScale["display-lg"].lineHeight}px\`,
  letterSpacing: typeScale["display-lg"].letterSpacing,
  fontWeight: fontWeights.semibold,
}}>
  Page title
</h1>

// Shorthand — spread the scale, add weight
<p style={{ fontFamily, ...typeScale["text-md"], fontWeight: fontWeights.regular }}>
  Body text
</p>`}</code>
          </pre>
        ) : (
          <DesignTip>Maintain a maximum of 3–4 type sizes per screen to keep visual hierarchy clear. Use weight to create emphasis rather than adding more sizes.</DesignTip>
        )}
      </section>
    </div>
  );
}
