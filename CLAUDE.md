# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Hubera

**Hubera VD** (Vibe Design) — a SaaS design system registry where people browse, fork, and publish design systems. Each system can be installed into any project via Claude Code through the hosted MCP server. Think 21st.dev but for complete design systems (tokens + providers + components), not just individual components.

**Platforms supported:** web-react, ios-swiftui, android-compose, flutter, react-native. The catalog splits into Web vs Mobile categories (cookie-driven). See `src/lib/platforms.ts` for the platform/category metadata.

## Commands

- `npm run dev` — start dev server on port 3001
- `npm run build` — production build (runs `prebuild` to copy screenshots first)
- `npm run lint` — ESLint (flat config, core-web-vitals + typescript)
- `npm run seed` — import `design-systems/*/ds-manifest.json` files into Supabase
- `npm run db:link` — link this repo to the Supabase project (one-time, after `npx supabase login`)
- `npm run db:push` — apply pending migrations from `supabase/migrations/`
- `npm run db:status` — show which migrations are applied vs pending
- `npm run db:diff` — auto-generate a migration from local schema changes

Manual extractor debugging:
- `npx tsx scripts/test-extractor.ts` — run the extractor against Hubera's own repo, prints the draft manifest
- `GET /api/dev-extract?repo=…&platform=…` — dev-only HTTP endpoint that returns a draft manifest as JSON (404 in production)

No test framework is configured.

## Architecture

**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript, Supabase (Postgres + Auth + Storage).

**Path alias:** `@/*` maps to `./src/*`.

### Data Layer

All design system metadata lives in Supabase. The public catalog and MCP server both read from the database:

- `src/lib/registry.ts` — stateless public Supabase client for reading published design systems (`getAllManifests`, `getManifestBySlug`, `getAllSlugs`, `getForks`). Uses the anon key — RLS ensures only published rows are visible.
- `src/lib/supabase/server.ts` — server/browser/admin clients (`createClient`, `createAdminClient`)
- `src/lib/supabase/types.ts` — generated Supabase row/json types (update when DB schema changes)
- `src/lib/types.ts` — canonical `DSManifest`, `DSPlatform`, `DSSourceLayout`, `DSComponent`, `DSTokens` types — the contract every extractor/MCP tool/UI consumer agrees on
- `src/lib/platforms.ts` — `PLATFORMS` array, `CATEGORIES` (web/mobile), category cookie helpers

Pages (home, catalog, detail) are server components that call `getAllManifests()` directly. No client-side fetching for the registry.

### Database Schema

`supabase/schema.sql` is the canonical declaration; `supabase/migrations/` is what actually runs. Four tables:

- `profiles` — mirrors `auth.users` with public fields (github_username, display_name, avatar_url, approval_status)
- `design_systems` — slug, name, version, platform, owner_id, repository_url, install_path, manifest JSONB, published flag, parent_id (for forks)
- `design_system_stats` — views, installs, stars per system
- `ingest_jobs` — async extraction jobs created by `/api/ingest`; columns: status (queued|running|done|failed), draft_manifest, warnings, error, design_system_id (set on publish)

RLS policies: published systems are public-readable; owners can manage their own; users see only their own ingest jobs. Triggers auto-create profile on signup, auto-create stats row on new design system insert, and update `updated_at` on every change.

#### Migration Workflow

**Always use the Supabase CLI — never paste SQL into the dashboard.** The hand-paste workflow caused schema drift (the `ingest_jobs` and `platform` column issues).

- Migration files live in `supabase/migrations/` and **must** be named `<YYYYMMDDHHMMSS>_<name>.sql` (the CLI ignores other formats)
- Write idempotent SQL (`create table if not exists`, `add column if not exists`, `drop policy if exists` before `create policy`) so re-runs are safe
- `npm run db:push` connects to the linked project, checks `supabase_migrations.schema_migrations`, applies what's new, and registers the timestamp
- For production, the same `db:push` is what your deploy pipeline should run

### Design System Manifest (`ds-manifest.json`)

Each design system's metadata is a single JSON file. Key fields:

- `slug`, `name`, `version`, `description`, `author`, `license`
- `platform` — one of `web-react`, `ios-swiftui`, `android-compose`, `flutter`, `react-native`
- `repository` — GitHub URL where source files live
- `defaultBranch` — branch to fetch from (default: `main`)
- `installPath` — where the DS lives inside this repo (e.g. `design-systems/jetsnack`)
- `sourceLayout` — where each piece lives in the *source* repo (see below)
- `tokens` — color scales (often nested by name), typography, spacing, radius
- `components` — array of `{ name, file, variants?, sizes? }` where `file` is **relative to `sourceLayout.componentsDir`** (so subdirs like `components/Button.kt` work)
- `parent` — slug of the DS this was forked from (or `null` for originals)
- `technology`, `architecture`, `tags` — discovery metadata

#### `sourceLayout` Field

Platform-aware. All five platforms share the same shape:

```json
"sourceLayout": {
  "platform": "android-compose",
  "componentsDir": "Jetsnack/app/src/main/java/com/example/jetsnack/ui",
  "files": [
    { "path": "...theme/Color.kt", "role": "colorKt" },
    { "path": "...theme/Theme.kt", "role": "themeKt" }
  ],
  "importHints": { /* optional, e.g. SPM target, gradle module */ }
}
```

- `componentsDir` — repo-relative directory under which all `components[].file` paths resolve.
- `files` — non-component files (tokens, providers, theme/color/shape/typography). Each `role` comes from `ROLES_BY_PLATFORM` in `src/lib/ingest/roles.ts`.
- `writeTo` (optional per file) — overrides the default install target in the consuming project.

The MCP install tools fetch each `componentsDir + component.file` and each `files[].path` via the raw GitHub content API.

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

Install tools return `{ files: FileEntry[], setupInstructions, importAliasNote }`. Claude Code writes the files into the target project. Setup instructions are platform-specific and live in `src/lib/mcp/setup-templates.ts`.

### Ingest Pipeline

`/api/ingest` accepts a `{ repoUrl, platform, branch?, subpath? }` payload, creates an `ingest_jobs` row in Supabase, and runs extraction in the background via Next's `after()`. Job status is polled at `/api/ingest/[jobId]`. Once complete, the user reviews/edits the draft manifest and can publish via `/api/ingest/[jobId]/publish`.

- `src/lib/ingest/index.ts` — dispatcher: `extractManifest({ platform, repoUrl, ... })` looks up the right extractor in `EXTRACTORS` and runs it
- `src/lib/ingest/fetch-tree.ts` — GitHub tree API wrapper (5000 entry cap)
- `src/lib/ingest/extractors/_shared.ts` — `commonAncestor`, `dirname`, `relativeTo`, `suggestSlug`, `toTitleCase` shared across all extractors
- `src/lib/ingest/extractors/<platform>.ts` — one file per platform, each exports `{ platform, extract(input): Promise<DraftManifest> }`
- `src/lib/ingest/roles.ts` — per-platform role taxonomy + write-target helpers

When adding a new extractor:
1. Pattern-match the file shape — token files vs component files (use filename + content heuristics)
2. Compute `componentsDir` from `commonAncestor(componentEntries.map(c => dirname(c.fullPath)))`
3. Set each `component.file` to `relativeTo(componentsDir, fullPath)` so MCP install can resolve nested paths
4. Register in `EXTRACTORS` in `src/lib/ingest/index.ts`

### Component Explorer (catalog detail pages)

Detail pages dispatch on `manifest.platform`:

- **Web (`web-react`)** — `src/components/registry/component-explorer.tsx` renders a live Sandpack preview (`live-component-sandbox.tsx`) of the actual component source pulled from GitHub, plus a Playground.
- **Mobile (everything else)** — `src/components/registry/mobile-component-viewer.tsx` shows a component list, optional screenshot strip, and the raw source file fetched via `/api/ds-source/[slug]` (since mobile DSes can't run in a browser sandbox).

#### Sandbox quirks (when touching `live-component-sandbox.tsx`)

- **Sandpack has no Next.js.** `rewriteAliasImports` rewrites `next/{link,image,navigation}` to local shims at `/_shims/*` (`NEXT_SHIMS` const). If you add new next/* imports to a hub component, add a shim too.
- **CSS sanitizer** strips `@import` of bare package names, `@tailwind`, `@plugin`, `@config`, `@custom-variant`, `@theme` blocks, and `@apply`. Anything not stripped that doesn't resolve crashes Sandpack with the cryptic "Path must be a string. Received null".
- **Color recognition** for swatches happens in `color-palette-preview.tsx` and `ds-preview-carousel.tsx`. Both regexes must include `oklch` and `color()` for Tailwind v4 / OKLCH systems (Hubera) to render.
- **Default examples** for new component name patterns go in `defaultExampleCode()`. The fallback `<Comp>{name}</Comp>` only works for text-content components — layout/composition components need an explicit pattern.
- The sandbox fetches **all components in `manifest.components`** in one round-trip, not just the primary, because any sibling can be a transitive import.

### Auth

Supabase Auth with GitHub OAuth. See:

- `src/middleware.ts` → `src/lib/supabase/middleware.ts` — session refresh on every request
- `src/app/login/` — login page
- Middleware gracefully skips auth when Supabase env vars aren't set (for local dev without credentials)

### Hubera UI Layer

Hubera's own UI lives in two places:

- `src/components/hub/*` — the in-app component library (Button, Input, Card, Modal, Tabs, etc.) exported through `src/components/hub/index.ts`. Import via `@/components/hub`.
- `src/components/editorial.tsx` — shared editorial primitives (Eyebrow, Rule, SectionHeader, PrimaryPill, GhostArrowLink, CopyCommand) used by landing/marketing pages.

Tokens live in a single file: `src/lib/nothing-tokens.ts` (`getNd`, `getShadow`, `motion`, `swatchRadii`, `applyType`). The legacy `src/styles/` and `src/components/ui/` directories have been removed.

Project-specific shells (not part of the reusable library): `src/components/ds-header.tsx`, `src/components/ds-topnav.tsx`, `src/components/ds-sidebar.tsx`, `src/components/dashboard-shell.tsx`, `src/components/site-header.tsx`, `src/components/site-footer.tsx`, `src/components/registry/*`, `src/components/brand/*`.

### Component Authoring Pattern

All `hub/*` components follow the same pattern — do not deviate:

1. `"use client"` directive
2. Props interface extending native HTML attributes, with custom variant/size props
3. Size config object with pixel values (height, padding, fontSize, radius, gap)
4. `forwardRef` wrapper for ref forwarding
5. `useTheme()` → `getNd(theme)` from `@/lib/nothing-tokens` → inline `style` objects (no `className`-driven theming)
6. Hover/focus/pressed states managed via `useState` + JS event handlers (not CSS pseudo-classes)
7. **Tailwind is layout-only** — never use Tailwind for component color, sizing, or theming

### Dark Mode

Class-based (`.dark` on `<html>`). Inline script in `layout.tsx` prevents flash. Tailwind v4 custom variant in `globals.css`.

### Screenshot Pipeline

`scripts/copy-screenshots.mjs` copies `design-systems/*/screenshots/*` to `public/registry/[slug]/` at build time. The `public/registry/` directory is gitignored.

### Seeded Design Systems (`design-systems/`)

Each subdirectory holds a `ds-manifest.json` (consumed by `npm run seed`) and a `screenshots/` folder. Currently seeded: `octopus` (web-react), `cesp` (web-react), `jetsnack` (android-compose — first mobile DS).

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
