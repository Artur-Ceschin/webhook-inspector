# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

A two-package monorepo:

- `api/` — Fastify + Zod + Drizzle ORM (Postgres). Captures and serves webhooks.
- `web/` — React 19 + Vite + TanStack Router + Tailwind v4. Browses them.

The workspace file at the root is named `pnpm-worspace.yml` (typo, and wrong extension), so pnpm does **not** treat this as a workspace. Dependencies are installed per package — run `pnpm install` inside `api/` or `web/`, not at the root. Each has its own `pnpm-lock.yaml`.

## Commands

```bash
# api/ (port 3333, docs at /docs)
docker compose -f api/docker-compose.yml up -d   # Postgres 17, docker/docker/webhooks on 5432
pnpm dev            # tsx watch, loads .env
pnpm lint           # biome lint .
pnpm format         # biome format --write .
pnpm db:generate    # emit a migration from schema changes
pnpm db:migrate     # apply migrations
pnpm db:studio      # Drizzle Studio
pnpm db:seed        # src/db/seed.ts (currently empty)

# web/
pnpm dev            # Vite
pnpm build          # tsc -b && vite build
pnpm format
```

There is no test runner configured in either package, and no lint script in `web/` (run `pnpm biome lint .` directly). `api`'s `build` script is `node dist/server.js` — it runs a compiled output that nothing produces; there is no compile step, so the API is dev-only today.

`api/.env` needs `DATABASE_URL` (validated by `src/env.ts`; the app crashes at import time if it's missing or not a URL). The README mentions `.env.example`, but that file does not exist.

## API architecture

**Zod-first routing.** Each route lives in its own file under `src/routes/`, exports a `FastifyPluginAsyncZod`, and declares its `schema` (params / querystring / response) with Zod. That one declaration validates the request, types the handler, and generates the OpenAPI doc served by Scalar at `/docs`. Never write a separate spec.

Response schemas are derived from the DB, not hand-written: `createSelectSchema(webhooks)` from `drizzle-zod`, `.pick()`ed down when the route returns a subset. Keep it that way so schema changes propagate.

**Registering routes.** `src/server.ts` sets the Zod validator/serializer compilers, then `app.register(...)` for each route plugin. A new route file is inert until registered there. Note `listWebHooks.ts` is currently written but not registered, and it collides on `GET /api/webhooks` with `get-webhook.ts` (which declares an `id` param that has no `:id` placeholder in its path) — resolve that before wiring either up.

**CORS.** `server.ts` registers `@fastify/cors` with `methods: ['GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']` — **`POST` is absent**, so browser-originated POSTs are rejected at preflight. Server-to-server webhook deliveries don't preflight and are unaffected, which is why `/capture` still works. Add `POST` before driving the capture endpoint from the web app.

**Capture endpoint.** `capture-webhook.ts` binds `app.all('/capture')` and is `hide: true` in the docs. It snapshots method, ip, content-type/length, headers (array values joined with `, `), body (stringified if not already a string), and derives `pathname` by stripping the `/capture` prefix. This is the one route that intentionally accepts any method and any shape.

**Database.** Single `webhooks` table (`src/db/schema/webhooks.ts`), re-exported through `src/db/schema/index.ts`, which is what `drizzle.config.ts` points at. Columns are declared without explicit names — `casing: 'snake_case'` is set in **both** `drizzle.config.ts` and `src/db/index.ts`, and they must stay in sync or generated SQL will not match runtime queries.

Primary keys are UUIDv7 stored as `text`, which makes them lexicographically time-ordered. Pagination exploits this: cursor = last id, `where lt(id, cursor)` + `orderBy desc(id)`, fetch `limit + 1` to detect more. Don't swap the id strategy without rewriting pagination.

Imports use the `@/*` alias (→ `src/`), configured in `api/tsconfig.json`.

## Web architecture

File-based routing via `@tanstack/router-plugin` — files in `src/routes/` generate `src/routeTree.gen.ts`, which is **generated; never edit it by hand**. `autoCodeSplitting` is on.

Tailwind v4 through `@tailwindcss/vite` — there is no `tailwind.config`. The palette is redefined in `src/index.css` under `@theme inline`: the `zinc-*` scale is overridden with custom dark-UI values, so `bg-zinc-950` etc. are project tokens, not stock Tailwind. Style with those scale names rather than arbitrary hex.

Components follow a consistent pattern: `interface XProps extends ComponentProps<'div'>`, spread `{...props}`, merge classes with `twMerge(defaults, className)`. Primitives live in `src/components/ui/`, feature components one level up. Imports are relative (no path alias configured on the web side).

The UI currently renders hardcoded placeholder data and is not yet wired to the API.

## Formatting

Both packages use Biome 2.5.5 with the same config: 2-space indent, 80 columns, **single quotes, semicolons as-needed**, organize-imports assist on. Most existing source was written before the formatter was run and uses double quotes and semicolons — running `pnpm format` will rewrite those files wholesale. Prefer formatting only files you touch unless a repo-wide reformat is the intent.

`api/.vscode/settings.json` sets Biome as the default formatter with format-on-save and `source.fixAll.biome` — so editing an `api/` file in VS Code reformats it on save regardless. TypeScript files are the exception: they're routed to the built-in TS formatter there, which is why the double-quote style has persisted.

## Working together

**I identify what needs to change; you make the edits.** When you ask me to fix something or implement a feature, I'll read the relevant files, find the exact lines that need changing, and show you what to do — but I won't edit files directly. I'll tell you:
- Which file and line number
- What the current code is
- What it should be, and why

This keeps you in control of your codebase and lets you review each change before it lands.
