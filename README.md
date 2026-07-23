# Webhook Inspector

Capture incoming webhooks and inspect them later — method, headers, body, query params, all of it.

A small monorepo: a Fastify API that stores the webhooks, and a React app to browse them.

```
api/   Fastify + Zod + Drizzle ORM (Postgres)
web/   React + Vite
```

## Getting started

```bash
pnpm install
docker compose -f api/docker-compose.yml up -d   # Postgres
```

**API** (`api/`)

```bash
cd api
cp .env.example .env    # set DATABASE_URL
pnpm db:migrate
pnpm dev
```

Runs at `http://localhost:3333`. Interactive docs (Scalar) at `http://localhost:3333/docs`.

**Web** (`web/`)

```bash
cd web
pnpm dev
```

## Why Zod-first

Every route in the API defines its request/response shape once, as a Zod schema. That schema does three jobs at the same time: validates incoming requests, types the handler, and generates the OpenAPI docs. Change the schema and the docs update with it — no separate spec to keep in sync.

## Stack

- [Fastify](https://fastify.dev/) — HTTP server
- [Zod](https://zod.dev/) — validation, via `fastify-type-provider-zod`
- [Drizzle ORM](https://orm.drizzle.team/) + Postgres — persistence
- [Scalar](https://github.com/scalar/scalar) — API docs, generated from the Zod schemas
- [React](https://react.dev/) + [Vite](https://vite.dev/) — frontend
