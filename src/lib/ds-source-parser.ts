import type { DSComponentExample, DSPropType } from "./types";

/**
 * Lightweight, regex-based TypeScript parser that extracts a component's
 * prop schema and example JSX from its source file. Used by the explorer
 * to make Gallery/Playground work on design systems whose manifests only
 * declare `variants: N, sizes: N` counts without explicit `props` or
 * `examples` metadata — so the UI shows real variant/size names instead
 * of hiding the feature.
 *
 * This is deliberately a shallow parser. It handles the common patterns:
 *   type ButtonVariant = "primary" | "ghost" | "destructive";
 *   type ButtonSize = "sm" | "md" | "lg";
 *   interface ButtonProps extends ButtonHTMLAttributes<...> {
 *     variant?: ButtonVariant;
 *     size?: ButtonSize;
 *     disabled?: boolean;
 *     loading?: boolean;
 *   }
 *
 * It does not try to resolve imported types or walk a real TS AST. If the
 * component uses fancier patterns (generics, discriminated unions, etc.)
 * the inferred schema is an approximation — the manifest can always
 * override it with explicit values.
 */

export interface InferredSchema {
  props: Record<string, DSPropType>;
  examples: DSComponentExample[];
}

// Matches string-literal unions using either "double" or 'single' quotes.
const STRING_UNION_RE = /^(?:\s*(?:"[^"]*"|'[^']*')\s*\|?\s*)+$/;
const STRING_LITERAL_RE = /(?:"([^"]*)"|'([^']*)')/g;

/**
 * Walk `source` from `openIdx` (which must point at `{`, `[`, or `(`) to its
 * matching close, returning the index of the close. Handles nested brackets.
 */
function matchBracket(source: string, openIdx: number): number {
  const open = source[openIdx];
  const close = open === "{" ? "}" : open === "[" ? "]" : ")";
  let depth = 0;
  for (let i = openIdx; i < source.length; i++) {
    const ch = source[i];
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Extract the top-level object keys of a JS object-literal body (everything
 * between the outermost `{` and `}`, not including those braces). Ignores
 * keys inside nested brackets.
 */
function extractTopLevelObjectKeys(body: string): string[] {
  const keys: string[] = [];
  let i = 0;
  while (i < body.length) {
    const ch = body[i];
    // Skip over any nested bracket/paren/string so we only see top-level keys.
    if (ch === "{" || ch === "[" || ch === "(") {
      const close = matchBracket(body, i);
      if (close === -1) break;
      i = close + 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      // Skip over string (best-effort; ignores escaped quotes within).
      const end = body.indexOf(ch, i + 1);
      if (end === -1) break;
      i = end + 1;
      continue;
    }
    // Look for an identifier or quoted key followed by `:`.
    const m = body.slice(i).match(
      /^\s*(?:([A-Za-z_$][A-Za-z0-9_$]*)|"([^"]+)"|'([^']+)')\s*:/
    );
    if (m) {
      const key = m[1] ?? m[2] ?? m[3];
      if (key) keys.push(key);
      i += m[0].length;
      continue;
    }
    i++;
  }
  return keys;
}

/**
 * Parse cva() / tv() / cn()-wrapped variant declarations from a component
 * source file. These are the two most common variant-definition libraries
 * in modern React DSes (class-variance-authority, tailwind-variants), so
 * handling them is what makes inference work "by default" for any newly
 * ingested system that follows today's conventions.
 *
 *   const buttonVariants = cva(base, {
 *     variants: { variant: { primary: "...", ghost: "..." }, size: { sm, md, lg } },
 *     defaultVariants: { variant: "primary", size: "md" },
 *   });
 *
 * Returns a map of variant-prop-name → value-list, plus a defaults map.
 */
function collectCvaVariants(source: string): {
  variants: Record<string, string[]>;
  defaults: Record<string, string>;
} {
  const out = { variants: {} as Record<string, string[]>, defaults: {} as Record<string, string> };

  // Locate `variants: {` — works for both cva() and tv() since they share the
  // same option shape.
  const variantsIdxRe = /\bvariants\s*:\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = variantsIdxRe.exec(source)) !== null) {
    const openIdx = source.indexOf("{", m.index);
    const closeIdx = matchBracket(source, openIdx);
    if (closeIdx === -1) continue;
    const body = source.slice(openIdx + 1, closeIdx);

    // For each top-level entry `<name>: { ... }`, collect the sub-object keys.
    let i = 0;
    while (i < body.length) {
      while (i < body.length && /[\s,;]/.test(body[i])) i++;
      if (i >= body.length) break;

      const header = body.slice(i).match(
        /^(?:([A-Za-z_$][A-Za-z0-9_$]*)|"([^"]+)"|'([^']+)')\s*:\s*\{/
      );
      if (!header) {
        i++;
        continue;
      }
      const variantName = header[1] ?? header[2] ?? header[3];
      i += header[0].length;

      // Walk matching braces on the sub-object.
      let depth = 1;
      const subOpen = i;
      while (i < body.length && depth > 0) {
        const ch = body[i];
        if (ch === "{") depth++;
        else if (ch === "}") depth--;
        i++;
      }
      const subBody = body.slice(subOpen, i - 1);

      const keys = extractTopLevelObjectKeys(subBody);
      if (variantName && keys.length > 0) out.variants[variantName] = keys;
    }
    break; // only parse the first variants block per file (normally one per component)
  }

  // defaultVariants: { variant: "primary", size: "md" }
  const defaultsRe = /\bdefaultVariants\s*:\s*\{([\s\S]*?)\}/;
  const dm = source.match(defaultsRe);
  if (dm) {
    const entryRe = /([A-Za-z_$][A-Za-z0-9_$]*)\s*:\s*["']([^"']+)["']/g;
    let em: RegExpExecArray | null;
    while ((em = entryRe.exec(dm[1])) !== null) {
      out.defaults[em[1]] = em[2];
    }
  }

  return out;
}

function collectTypeAliases(source: string): Record<string, string[]> {
  const aliases: Record<string, string[]> = {};
  // Accept both `;` and end-of-line terminated aliases so single-line
  // declarations without a trailing `;` still parse.
  const aliasRe = /type\s+([A-Z][A-Za-z0-9_]*)\s*=\s*([^;\n]+)[;\n]/g;
  let m: RegExpExecArray | null;
  while ((m = aliasRe.exec(source)) !== null) {
    const name = m[1];
    const body = m[2];
    if (!STRING_UNION_RE.test(body.replace(/\s+/g, " "))) continue;
    const values = [...body.matchAll(STRING_LITERAL_RE)].map(
      (mm) => mm[1] ?? mm[2]
    );
    if (values.length > 0) aliases[name] = values;
  }
  return aliases;
}

/**
 * Find the body of the props interface/type for a component. Searches
 * standard naming patterns (FooProps, Props) and balances braces manually
 * so nested object types in prop signatures don't truncate the match.
 */
function findPropsInterface(
  source: string,
  componentName: string
): string | null {
  const candidates = [
    `${componentName}Props`,
    `${componentName.replace(/Button$/, "")}Props`,
    "Props",
  ];

  for (const name of candidates) {
    const headerRe = new RegExp(
      `(?:interface|type)\\s+${name}\\b[^{=]*[={]`,
      "m"
    );
    const headerMatch = source.match(headerRe);
    if (!headerMatch || headerMatch.index === undefined) continue;

    // Walk forward from the opening `{` matching braces to find the close.
    const openIdx = source.indexOf("{", headerMatch.index);
    if (openIdx === -1) continue;

    let depth = 0;
    for (let i = openIdx; i < source.length; i++) {
      const ch = source[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          return source.slice(openIdx + 1, i);
        }
      }
    }
  }
  return null;
}

const SKIP_PROP_NAMES = new Set([
  "children",
  "className",
  "style",
  "key",
  "ref",
  "as",
  "onClick",
  "onChange",
  "onFocus",
  "onBlur",
  "onKeyDown",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
]);

function parsePropsBody(
  body: string,
  aliases: Record<string, string[]>
): Record<string, DSPropType> {
  const out: Record<string, DSPropType> = {};
  // Match `name?: Type;` or `name: Type;` — stop at `;` or end of line.
  const lineRe = /^\s*([A-Za-z_][A-Za-z0-9_-]*)\??\s*:\s*([^;]+?);?\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(body)) !== null) {
    const rawName = m[1];
    const rawType = m[2].trim();

    if (SKIP_PROP_NAMES.has(rawName)) continue;
    if (rawName.startsWith("on") && /^on[A-Z]/.test(rawName)) continue;

    // Inline string union: `"a" | "b" | "c"` or `'a' | 'b' | 'c'`
    if (STRING_UNION_RE.test(rawType)) {
      const values = [...rawType.matchAll(STRING_LITERAL_RE)].map(
        (mm) => mm[1] ?? mm[2]
      );
      if (values.length > 1) {
        out[rawName] = { type: "enum", values, default: values[0] };
        continue;
      }
    }

    // Reference to a declared type alias
    const aliasMatch = rawType.match(/^([A-Z][A-Za-z0-9_]*)\b/);
    if (aliasMatch && aliases[aliasMatch[1]]) {
      const values = aliases[aliasMatch[1]];
      out[rawName] = { type: "enum", values, default: values[0] };
      continue;
    }

    // Primitive scalars we can play with
    if (/^boolean\b/.test(rawType)) {
      out[rawName] = { type: "boolean", default: false };
      continue;
    }
    if (/^number\b/.test(rawType)) {
      out[rawName] = { type: "number", default: 0 };
      continue;
    }
    if (/^string\b/.test(rawType)) {
      out[rawName] = { type: "string", default: "" };
      continue;
    }

    // Everything else (ReactNode, functions, complex generics) is out of scope.
  }
  return out;
}

function humanCaseToTitle(raw: string): string {
  return raw
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b./, (c) => c.toUpperCase());
}

function buildExamples(
  componentName: string,
  props: Record<string, DSPropType>,
  opts: { variantCount?: number; sizeCount?: number }
): DSComponentExample[] {
  const variantProp = findEnumProp(props, [
    "variant",
    "kind",
    "appearance",
    "intent",
    "tone",
  ]);
  const sizeProp = findEnumProp(props, ["size"]);
  const booleanFlagProps = Object.entries(props)
    .filter(
      ([name, p]) =>
        p.type === "boolean" && /^(disabled|loading|destructive|active)$/i.test(name)
    )
    .map(([name]) => name);

  const examples: DSComponentExample[] = [];
  const Comp = componentName;

  if (variantProp) {
    for (const v of variantProp.values) {
      examples.push({
        name: humanCaseToTitle(v),
        code: `<${Comp} ${variantProp.name}="${v}">${humanCaseToTitle(v)}</${Comp}>`,
      });
    }
  } else if (sizeProp) {
    for (const s of sizeProp.values) {
      examples.push({
        name: `Size ${s.toUpperCase()}`,
        code: `<${Comp} ${sizeProp.name}="${s}">${componentName}</${Comp}>`,
      });
    }
  }

  // Append one boolean-flag example so disabled/loading states show up too.
  for (const flag of booleanFlagProps) {
    examples.push({
      name: humanCaseToTitle(flag),
      code: `<${Comp} ${flag}>${humanCaseToTitle(flag)}</${Comp}>`,
    });
  }

  // If the manifest counts claim more variants/sizes than we parsed, we
  // don't fabricate — parsed names are authoritative. Consumers can still
  // see the real count in the header meta line.
  void opts;

  return examples;
}

function findEnumProp(
  props: Record<string, DSPropType>,
  candidates: string[]
): { name: string; values: string[] } | null {
  for (const name of candidates) {
    const p = props[name];
    if (p && p.type === "enum") return { name, values: p.values };
  }
  // Case-insensitive fallback
  for (const [name, p] of Object.entries(props)) {
    if (p.type !== "enum") continue;
    if (candidates.some((c) => c.toLowerCase() === name.toLowerCase())) {
      return { name, values: p.values };
    }
  }
  return null;
}

/**
 * Parse a component's TypeScript source and return a best-effort
 * `{ props, examples }` schema. Both fields are always present; empty
 * when nothing could be inferred.
 *
 * Two parallel extraction paths run and their results merge, so the
 * broadest possible set of DS conventions works out of the box:
 *   1. TypeScript prop-types — `type Variant = "a" | "b"` + an interface.
 *   2. cva / tv variant objects — `cva(base, { variants: { ... } })`.
 *
 * The interface path wins when both declare the same prop (the interface
 * is the component's public contract). The cva path fills gaps for DSes
 * that don't declare explicit prop types at all (very common today).
 */
export function inferComponentSchema(
  source: string,
  componentName: string,
  opts: { variantCount?: number; sizeCount?: number } = {}
): InferredSchema {
  const aliases = collectTypeAliases(source);
  const body = findPropsInterface(source, componentName);
  const interfaceProps = body ? parsePropsBody(body, aliases) : {};

  const cva = collectCvaVariants(source);

  // Merge: interface props win; cva fills gaps and enriches values.
  const props: Record<string, DSPropType> = { ...interfaceProps };
  for (const [name, values] of Object.entries(cva.variants)) {
    if (!values || values.length === 0) continue;
    const existing = props[name];
    if (existing && existing.type === "enum") {
      // Existing enum might be a subset — union with cva values for completeness.
      const union = Array.from(new Set([...existing.values, ...values]));
      props[name] = {
        type: "enum",
        values: union,
        default: cva.defaults[name] ?? existing.default ?? union[0],
      };
    } else if (!existing) {
      props[name] = {
        type: "enum",
        values,
        default: cva.defaults[name] ?? values[0],
      };
    }
  }

  const examples = buildExamples(componentName, props, opts);
  return { props, examples };
}
