# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Octopus DS

Standalone design system documentation app — the external twin of the design system embedded in `~/Desktop/octopus`. Runs independently to browse tokens and components.

## Commands

- `npm run dev` — start dev server (port 3001, to avoid conflict with octopus on 3000)
- `npm run build` — production build
- `npm run lint` — ESLint (flat config, core-web-vitals + typescript)

No test framework is configured.

## Architecture

**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript.

**Path alias:** `@/*` maps to `./src/*`.

### Sync Surface with `~/Desktop/octopus`

These directories are **synced** and must stay identical to the octopus project:

- `src/styles/*` — design tokens and color utilities
- `src/components/ui/*` — all UI components
- `src/components/providers/*` — ThemeProvider, RoleProvider
- `src/app/globals.css`

**NOT synced** (project-specific): `src/components/ds-header.tsx`, `src/components/ds-sidebar.tsx`, `src/app/layout.tsx`, `src/app/page.tsx`.

Key difference: in octopus, doc pages live under `/ds/*` routes. Here they live at root (`/colors`, `/buttons`, etc.).

### Design Token System

Core lives in `src/styles/`:
- `design-tokens.ts` — color palettes (29 scales × 12 shades), typography, spacing, radius, and semantic tokens via `getSemanticTokens(mode, brandOverride?)`.
- `color-utils.ts` — HSL conversion, `generateBrandPalette(hex)`, validation, presets.

Components consume tokens via `getSemanticTokens()` + `useTheme()` with inline styles. Tailwind is used for layout/utility classes only.

### Context Providers (`src/components/providers/`)

- `ThemeProvider` — light/dark mode + custom brand color. Persists to localStorage.
- `RoleProvider` — developer/designer view toggle. Persists to localStorage.

### Dark Mode

Class-based (`.dark` on `<html>`). Inline script in `layout.tsx` prevents flash. Tailwind v4 custom variant in `globals.css`.

### UI Components (`src/components/ui/`)

Pattern: `useTheme()` → `getSemanticTokens(theme, brandPalette)` → inline `style` objects. Hover/focus via JS event handlers.
