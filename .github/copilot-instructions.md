# Copilot instructions for `finance-app`

This repository currently contains an Expo React Native app in `finance-frontend/` (as noted by the root `README.md`).

## Build, test, and lint commands

Run all app commands from:

```bash
cd finance-frontend
```

Available scripts:

```bash
npm run start        # Expo dev server
npm run android      # Open on Android via Expo
npm run ios          # Open on iOS via Expo
npm run web          # Open on web via Expo
npm run test         # Full Jest suite
npm run test:api     # API-focused Jest tests (src/api)
```

Run a single test file:

```bash
npm run test -- src/api/__tests__/gastos.test.ts
```

There is currently no dedicated `lint` or `build` npm script in `finance-frontend/package.json`.

## High-level architecture

- **Routing/UI shell:** Expo Router file-based routes under `finance-frontend/app/`.
  - `app/_layout.tsx` sets the root stack and mounts `(tabs)` and modal stacks.
  - `app/(tabs)/_layout.tsx` defines the bottom-tab navigation (`index`, `gastos`, `ahorros`, `resumen`, `settings`).
- **Screen layer:** Tab and modal screens fetch/mutate data directly through `src/api/*` modules and render feature components from `src/components/*`.
- **Shared app state:** `src/store/periodoStore.ts` (Zustand) stores the active `periodo`; screens use it to scope queries and mutations.
- **Domain contracts:** `src/types/models.ts` is the central source for API/domain types used across screens and API clients.
- **HTTP layer:** `src/api/client.ts` defines a shared Axios client, timeout/base URL config, error normalization, and `unwrapData`.
  - Most endpoints return `{ data: ... }` and use `unwrapData`.
  - `src/api/resumen.ts` is intentionally different: it reads `response.data` directly.

## Key conventions in this codebase

- **Language/domain naming is Spanish-first:** screen names, UI copy, and domain terms use Spanish (`gastos`, `ahorros`, `periodo`, `presupuestos`). Keep this naming style when adding new code.
- **Locale/currency formatting:** UI consistently formats dates and numbers with `es-AR` conventions.
- **Period-scoped operations:** most reads/writes require `periodo?.id` and pass `periodo_id` filters; preserve this pattern to avoid cross-period data leaks.
- **Gasto currency metadata convention:** expenses persist currency in `nota` using `[moneda: USD]` suffix helpers in `app/modals/nuevo-gasto.tsx` (`stripMonedaMetadata` / `buildNotaWithMoneda`). Reuse this mechanism for gasto-currency behavior.
- **Modal route convention:** navigation targets `/modals/nuevo-gasto` and `/modals/nuevo-ahorro`; maintain compatibility with that path structure when changing modal flows.
- **API module pattern:** each resource has a dedicated file in `src/api/` exporting thin, typed functions (`get*`, `create*`, `update*`, `delete*`) over `apiClient`.
- **API tests pattern:** tests under `src/api/__tests__/` use `axios-mock-adapter` against the shared `apiClient` and assertions from `@jest/globals`.
