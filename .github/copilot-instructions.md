# Wolf Blog Frontend – AI Coding Instructions

## Architecture & Layout

- Nuxt 4 + TypeScript single app; `app/layouts/default.vue` keeps content below `NavigationMenuHeader` using `--ui-header-height` declared in `app/assets/css/main.css`.
- Routing lives under `app/pages/**`; dynamic article routes (e.g. `[articleId].vue`) pair `useAsyncData` keys with route params so cached payloads can be restored from `history.state` before refetching.
- Global CSS pulls Tailwind, Nuxt UI, and `md-editor-v3`; keep structural tokens aligned with the `UMain` container sizing baked into the layout.

## Runtime & Config

- `nuxt.config.ts` registers `@nuxt/ui`, `@pinia/nuxt`, `@vueuse/nuxt`, `@nuxthub/core`, and exposes `runtimeConfig.public.{apiBase,apiBaseClient,apiBaseServer}`; populate via `.env.development` / `.env.production` (`NUXT_PUBLIC_*`).
- Custom icon sprite sheets in `app/assets/icons` are available via `UIcon name="app-icons:*"`; Nuxt UI theme tweaks (primary `sky` palette, pointer cursors) live in `app/app.config.ts`.

## Data & API

- `app/plugins/api.ts` wraps `$fetch` with `ignoreResponseError`, injects `Authorization` from the `auth_token` cookie, and resets `useCurrentUser` on `UN_LOGIN` / `AUTH_FAILED` codes.
- Always return/consume `ApiResponse`; query helpers should call `useApi` (`app/composables/useApi.ts`) for computed `success/code/message/data`, while imperative calls belong in `app/apis/**` modules.
- `optionalField` + `filterUndefinedFields` (`shared/utils/data-process.ts`) keep nullable payloads intact; when sending bodies that may contain `null`, set `headers: { 'Content-Type': 'application/nullable+json' }` like existing POST/PUT handlers.

## Auth & User State

- `useCurrentUser` (`app/stores/user.ts`) is the only auth source: it stores the token cookie, refreshes via `userApi.getUserInfo`, and exposes `login/logout/refresh/clear`.
- Initialization is client-only (`nextTick(initializeUser)`); preserve that guard when adding new hooks to avoid SSR fetches.

## Page Patterns

- Index list (`app/pages/index.vue`) mutates a shared `reactive<ArticleListQuery>`; watchers debounce text search, normalize date filters to ISO strings, and drive `UPagination` via `query.pageNumber`.
- Article detail (`app/pages/articles/[articleId].vue`) first calls `consumeArticleDetailFromHistory` to reuse router state, then falls back to `getArticleDetail`; `refresh()` clears history keys before refetching.
- Comments (`app/components/article/ArticleComments.vue`) rely on `useAsyncData` keyed by article id, expose `scrollToComments`, and gate mutations on auth via `useCurrentUser` with toast feedback.
- Editors (`app/pages/articles/edit/[[articleId]].vue`) hydrate form state from detail APIs, use `md-editor-v3` components, and reuse the same `createArticle/patchArticle` helpers.

## UI Conventions

- `NavigationMenuHeader.vue` keeps hydration-safe labels (`slot: 'user'` with fixed text) and funnels all auth-aware menus through `useCurrentUser`; extend menus by editing the computed item arrays.
- Toasts standardize messaging through `useToast().add({ title, description?, color })`; follow existing `success`, `neutral`, `warning`, `error` choices for consistency.
- Dark/light mode toggles via `useColorMode` and `<UColorModeSelect>`; components should respect Tailwind `dark:` classes already present.

## Types & Utilities

- Domain types in `shared/types/*.d.ts` are globally declared (e.g., `Article.*`, `User.*`, `ApiResponse`), so prefer ambient usage over manual imports.
- `ApiError` (`shared/types/ApiError.ts`) wraps backend codes/data; API modules throw it on `!response.success`, and UI surfaces messages from its instances.
- Use `formatDateTime` / `sortDateTime` (`shared/utils/date.ts`) and `ARTICLE_VISIBILITY_*` constants when formatting or filtering article metadata.

## Dev Workflow

- Install with `pnpm install`; run `pnpm dev --host --dotenv .env.development` for local dev and `pnpm build --dotenv .env.production` + `pnpm preview` for production smoke tests.
- Quality gates: `pnpm typecheck` (runs `nuxt prepare` and `vue-tsc`), `pnpm lint`, `pnpm format`.
- If module aliases break after dependency tweaks, run `pnpm nuxt prepare` to regenerate Nuxt artifacts.
