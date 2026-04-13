# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Hubera

**Hubera VD** (Vibe Design) — a SaaS design system registry where people browse, fork, and publish design systems. Each system can be installed into any project via Claude Code through the hosted MCP server. Think 21st.dev but for complete design systems (tokens + providers + components), not just individual components.

## Commands

- `npm run dev` — start dev server on port 3001
- `npm run build` — production build (runs `prebuild` to copy screenshots first)
- `npm run lint` — ESLint (flat config, core-web-vitals + typescript)
- `npm run seed` — import `design-systems/*/ds-manifest.json` files into Supabase

No test framework is configured.

## Architecture

**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript, Supabase (Postgres + Auth + Storage).

**Path alias:** `@/*` maps to `./src/*`.

### Data Layer

All design system metadata lives in Supabase. The public catalog and MCP server both read from the database:

- `src/lib/registry.ts` — stateless public Supabase client for reading published design systems (`getAllManifests`, `getManifestBySlug`, `getAllSlugs`, `getForks`). Uses the anon key — RLS ensures only published rows are visible.
- `src/lib/supabase/server.ts` — server/browser/admin clients (`createClient`, `createAdminClient`)
- `src/lib/supabase/types.ts` — database type definitions (update when schema changes)

Pages (home, catalog, detail) are server components that call `getAllManifests()` directly. No client-side fetching for the registry.

### Database Schema

See `supabase/schema.sql`. Three tables:

- `profiles` — mirrors `auth.users` with public fields (github_username, display_name, avatar_url)
- `design_systems` — slug, name, version, owner_id, repository_url, sourceLayout, manifest JSONB, published flag, parent_id (for forks)
- `design_system_stats` — views, installs, stars per system

RLS policies: published systems are public-readable; owners can manage their own. Triggers auto-create profile on signup, auto-create stats row on new design system insert.

### Design System Manifest (`ds-manifest.json`)

Each design system's metadata is a single JSON file. Key fields:

- `slug`, `name`, `version`, `description`, `author`, `license`
- `repository` — GitHub URL where source files live
- `defaultBranch` — branch to fetch from (default: `main`)
- `sourceLayout` — where each piece lives in the repo (see below)
- `tokens` — color scales, typography, spacing, radius
- `components` — array of `{ name, file, variants?, sizes? }`
- `parent` — slug of the DS this was forked from (or `null` for originals)

#### `sourceLayout` Field

Tells the MCP server where files are located inside the source repository:

```json
"sourceLayout": {
  "components": "src/components/ui",
  "tokens": "src/styles/design-tokens.ts",
  "colorUtils": "src/styles/color-utils.ts",
  "themeProvider": "src/components/providers/theme-provider.tsx",
  "roleProvider": "src/components/providers/role-provider.tsx",
  "globalsCss": "src/app/globals.css"
}
```

Only `components` is required. The MCP server's GitHub reader fetches files from these paths via the raw GitHub content API.

### MCP Server

The MCP server is served from `/api/mcp` as a Next.js route handler. It's a stateless JSON-RPC 2.0 over HTTP implementation — no SDK session state required.

- `src/app/api/mcp/route.ts` — HTTP endpoint (POST for JSON-RPC, GET for info)
- `src/lib/mcp/tools.ts` — tool schemas + handlers, single dispatch point via `callTool`
- `src/lib/mcp/github-reader.ts` — fetches source files from GitHub raw content API (cached via Next.js fetch cache, 1 hour revalidate)
- `src/lib/mcp/dependency-resolver.ts` — static inter-component dependency map

Six tools exposed:

1. `browse_registry` — list all DS (with tech/architecture filters)
2. `get_design_system` — full manifest for a slug
3. `search_registry` — search by name/tag/tech/component
4. `get_tokens` — return token values (read-only)
5. `install_design_system` — fetch all source files for a DS via GitHub
6. `install_component` — fetch one component + its deps (tokens, providers, globals.css)

Install tools return `{ files: FileEntry[], setupInstructions, importAliasNote }`. Claude Code writes the files into the target project.

### Auth

Supabase Auth with GitHub OAuth. See:

- `src/middleware.ts` → `src/lib/supabase/middleware.ts` — session refresh on every request
- `src/app/login/` — login page
- Middleware gracefully skips auth when Supabase env vars aren't set (for local dev without credentials)

### Synced UI Components

These directories are **synced** with `~/Desktop/octopus` and must stay identical:

- `src/styles/*` — design tokens and color utilities
- `src/components/ui/*` — UI components
- `src/components/providers/*` — ThemeProvider, RoleProvider
- `src/app/globals.css`

**NOT synced** (project-specific): `src/components/ds-header.tsx`, `src/components/ds-topnav.tsx`, `src/components/dashboard-shell.tsx`, `src/components/registry/*`, `src/components/brand/*`, route pages, `layout.tsx`.

### Component Authoring Pattern

All UI components follow the same pattern — do not deviate:

1. `"use client"` directive
2. Props interface extending native HTML attributes, with custom variant/size props
3. Size config object with pixel values (height, padding, fontSize, radius, gap)
4. `forwardRef` wrapper for ref forwarding
5. `useTheme()` → `getSemanticTokens(theme, brandPalette)` OR `getNd(theme)` for Nothing-style → inline `style` objects
6. Hover/focus states managed via `useState` + JS event handlers (not CSS pseudo-classes)
7. **Tailwind is layout-only** — never use Tailwind for component color, sizing, or theming

### Dark Mode

Class-based (`.dark` on `<html>`). Inline script in `layout.tsx` prevents flash. Tailwind v4 custom variant in `globals.css`.

### Screenshot Pipeline

`scripts/copy-screenshots.mjs` copies `design-systems/*/screenshots/*` to `public/registry/[slug]/` at build time. The `public/registry/` directory is gitignored.

## Environment Variables

Required in `.env.local` (gitignored):

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public anon key (safe to expose)
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, used by seed script

Optional:

- `GITHUB_TOKEN` — personal access token to avoid GitHub API rate limits (60 req/hr unauthenticated → 5000 req/hr authenticated)

## Claude Tooling (`.claude/`)

- **8 agents** — design-system-architect, design-reviewer, ui-designer, ux-strategist, interaction-designer, design-researcher, design-ops-lead, designer-copilot
- **123 skills** across accessibility, design-systems, interaction-design, ui-design, ux-strategy, design-research, design-ops
- **27 commands** — slash commands for common design workflows

### MCP Servers (`.mcp.json`)

- **ds-registry** — Hubera's own MCP server. Local dev uses `http://localhost:3001/api/mcp`. In production, point to `https://<deployed-url>/api/mcp`.
- **supabase** — Official Supabase MCP server (requires `SUPABASE_ACCESS_TOKEN` env var)
- **puppeteer**, **chrome-devtools** — Browser automation
