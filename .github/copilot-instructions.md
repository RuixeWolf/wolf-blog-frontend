# Wolf Blog Frontend - AI Coding Instructions

## Quick map

- Nuxt 4 + TypeScript app (see `nuxt.config.ts`) with modules: `@nuxt/ui`, `@pinia/nuxt`, `@vueuse/nuxt`, `@nuxthub/core`. UI shell lives in `app/layouts/default.vue` with navigation in `app/components/NavigationMenuHeader.vue`.
- Runtime API endpoints come from `runtimeConfig.public.apiBaseClient` (browser) and `apiBaseServer` (SSR); populate them via `.env.development` / `.env.production` before running scripts.
- Tailwind utilities are provided through Nuxt UI; custom tokens live in `app/app.config.ts` (sky primary color) and `app/assets/css/main.css`.

## API contract & data flow

- `app/plugins/api.ts` wraps `$fetch` with token injection, optional TLS disabling for dev, and ensures every reply is an `ApiResponse<T>` object; HTTP 4xx/5xx never throw.
- Component data fetching should use `useApi()` (`app/composables/useApi.ts`) to get `success`, `message`, and `refresh` refs; it swaps in `useNuxtApp().$api` automatically.
- For imperative mutations, call helpers in `app/apis/**`; they coerce payloads, invoke `$api`, then throw `ApiError` (`shared/types/ApiError.ts`) when `response.success` is false so callers can `try/catch`.
- Optional fields use `application/nullable+json` Content-Type; see `app/apis/article/index.ts` for examples with `optionalField` and `filterUndefinedFields`.

## Types & utilities

- Domain types live in `shared/types/*.d.ts` as global namespaces (`Article.*`, `User.*`, `ApiResponse`, `ApiListData`) so you rarely need manual imports.
- Reuse `optionalField` and `filterUndefinedFields` from `shared/utils/data-process.ts` when building payloads to avoid leaking `undefined` into the API.
- See `shared/constants/article.ts` for visibility options and other enums.

## Auth flow

- `useCurrentUser` (`app/stores/user.ts`) owns the cookie (`auth_token`), exposes `login/logout/refresh`, and auto-initializes on client mount. Always go through the store instead of hitting auth APIs directly.
- The API plugin clears auth state and redirects (via the store) when backend codes `UN_LOGIN` or `AUTH_FAILED`; avoid duplicating this logic in components.
- Login redirects preserve return path: `?redirect=${encodeURIComponent(route.fullPath)}`

## Page patterns

- List pages (e.g. `app/pages/index.vue`) keep a `reactive` query object, watch for deep changes, and rely on `UPagination`; debounce search with `setTimeout`.
- Form/edit pages (`app/pages/articles/edit/[[articleId]].vue`) load data with `useApi`, mirror it into `reactive` form state, and submit via the `app/apis/article` functions, using `md-editor-v3` for content and Nuxt UI form pieces.
- Detail views (`app/pages/articles/[articleId].vue`) pair `MdPreview/MdCatalog` with Nuxt UI skeletons and error cards; follow the same success/refresh checks when adding new views.
- History state caching: Use `window.history.state` to cache article data during navigation (see `app/pages/articles/[articleId].vue` `consumeArticleDetailFromHistory`).

## Component patterns

- Navigation menu: SSR-safe conditional rendering based on auth state (`app/components/NavigationMenuHeader.vue`).
- Toolbar visibility: Scroll-based show/hide with threshold logic (see article detail page).
- Form validation: Reactive form state with imperative submission; use `toast.add()` for user feedback.
- Loading states: Combine `pending`, `success`, and error states with Nuxt UI skeletons/cards.

## Workflows & quality gates

- Scripts (see `package.json`): `pnpm dev --host --dotenv .env.development`, `pnpm build --dotenv .env.production`, `pnpm preview`, `pnpm typecheck` (`nuxt prepare` + `vue-tsc`), `pnpm lint` (ESLint via `@nuxt/eslint`), `pnpm format` (Prettier with import + Tailwind sorting).
- `nuxt prepare` is already hooked via `postinstall`, but run it manually if path aliases fail after dependency changes.
- Backend API documentation in `BACKEND_API.md` with unified `ApiResponse<T>` format.

## Implementation tips

- Prefer `useApiRaw` only when you need manual control of `transform` or headers; otherwise stick to the higher-level helpers.
- Keep new stores small and Pinia-based, mirroring the pattern in `app/stores/user.ts`.
- When adding icons, use the `i-lucide-*` convention supported by Nuxt UI and the `@iconify-json/lucide` package.
- For client-only features, check `import.meta.client` before accessing browser APIs.
- Use `computed` for derived state and `watch` for side effects; prefer reactive patterns over imperative DOM manipulation.
- API payloads: Use `optionalField` for nullable fields, `filterUndefinedFields` to clean objects before sending.
