# Wolf Blog Frontend – AI Coding Instructions

## Snapshot

- Nuxt 4 + TypeScript app composed via `app/layouts/default.vue`; layout reserves header height using `--ui-header-height` defined in `app/assets/css/main.css`.
- Custom icon sprites in `app/assets/icons` registered as `app-icons:*` through `nuxt.config.ts`; Nuxt UI theme tuned in `app/app.config.ts` (primary sky palette).

## Runtime & Config

- Runtime API endpoints come from `runtimeConfig.public.{apiBase,apiBaseClient,apiBaseServer}`; `.env.development` / `.env.production` provide `NUXT_PUBLIC_*` aliases.
- Global CSS imports Tailwind + Nuxt UI + `md-editor-v3` styles; `pnpm dev --host --dotenv .env.development` serves at :3000.

## API Access Pattern

- `app/plugins/api.ts` wraps `$fetch` so HTTP 4xx/5xx resolve to `ApiResponse`; it injects `Authorization` from the `auth_token` cookie and clears state on `UN_LOGIN` / `AUTH_FAILED`.
- Prefer `useApi` from `app/composables/useApi.ts` for queries: it auto-wires `$api` and exposes `success/code/message/data` computed refs.
- Imperative mutations live in `app/apis/**`; each coalesces payloads with `optionalField` + `filterUndefinedFields`, sets `application/nullable+json` when nulls allowed, and throws `ApiError` on `!response.success`.

## Auth & User

- `useCurrentUser` (`app/stores/user.ts`) is the single source of auth: it manages the `auth_token` cookie, refreshes `userInfo`, and exposes `isLoggedIn/login/logout/refresh`.
- Store initialization is client-only via `nextTick(initializeUser)`; whenever you change auth flows, preserve this SSR-safe pattern.

## Page Conventions

- Lists (`app/pages/index.vue`) keep a `reactive<ArticleListQuery>` and mutate it in-place; watchers debounce search (`setTimeout`), convert dates to ISO, and rely on `UPagination`.
- Detail view (`app/pages/articles/[articleId].vue`) uses `useAsyncData` with a route-based cache: `consumeArticleDetailFromHistory` pulls page state before calling `getArticleDetail`, so maintain the `history.replaceState` clears when refreshing.
- Editors (`app/pages/articles/edit/[[articleId]].vue`) mirror API data into reactive form state and submit via `createArticle/patchArticle`; `md-editor-v3` components expect global CSS already imported.

## UI & Components

- Header navigation (`app/components/NavigationMenuHeader.vue`) renders SSR-safe menus based on `useCurrentUser`; any new auth-aware UI should reuse the store to avoid hydration drift.
- Toast feedback uses `useToast().add({ title, description, color })`; follow existing success/neutral/error color choices for consistency.

## Types & Utilities

- Domain types are declared globally in `shared/types/*.d.ts` (e.g., `Article.*`, `User.*`); avoid importing them manually.
- `shared/utils/data-process.ts` (`optionalField`, `filterUndefinedFields`) is the canonical way to strip `undefined` while preserving `null`.
- `ApiError` (`shared/types/ApiError.ts`) carries `code`/`data`; catch it in components to surface backend messages.

## Workflows

- `pnpm typecheck` runs `nuxt prepare` + `vue-tsc`; run after touching `shared/types` or route components.
- `pnpm lint` uses `@nuxt/eslint` with auto-fix; `pnpm format` applies Prettier with import + Tailwind sorting.
- If aliases misbehave after dependency changes, re-run `pnpm nuxt prepare` (also triggered postinstall).
