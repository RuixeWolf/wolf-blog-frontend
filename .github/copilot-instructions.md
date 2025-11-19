# Wolf Blog Frontend – AI Coding Instructions

## Architecture & Layout

- **Framework**: Nuxt 4 + TypeScript + Nuxt UI (Tailwind CSS).
- **Directory Structure**: Standard Nuxt 4 `app/` directory.
  - `app/layouts/default.vue`: Main layout.
  - `app/pages/`: File-based routing.
  - `app/apis/`: API wrapper functions (e.g., `article/`, `user.ts`).
  - `app/components/`: Vue components (grouped by feature: `article/`, `user/`).
  - `shared/`: Shared types and utilities (outside `app/`).
- **Global Styles**: `app/assets/css/main.css` (Tailwind imports).

## Data & API

- **Plugin**: `app/plugins/api.ts` wraps `$fetch` to handle auth and errors.
  - **Auth**: Injects `Authorization` header from `auth_token` cookie.
  - **Error Handling**: Catches 4xx/5xx errors and returns `ApiResponse` with `success: false`. **Do not** wrap API calls in try-catch blocks for HTTP status errors; check `response.success` instead.
  - **Redirects**: Auto-redirects to login on `UN_LOGIN` or `AUTH_FAILED` codes.
- **Configuration**: `nuxt.config.ts` exposes `apiBase`, `apiBaseClient`, `apiBaseServer`. The plugin selects the correct base URL based on `import.meta.server`.
- **Usage Pattern**:
  - Define imperative API calls in `app/apis/**`.
  - Use `useAsyncData` in components/pages for SSR-compatible fetching.
  - Always return/consume `ApiResponse<T>`.
  - Handle nullable fields with `optionalField` / `filterUndefinedFields` (`shared/utils/data-process.ts`).

## Auth & User State

- **Store**: `useCurrentUser` (`app/stores/user.ts`) is the single source of truth.
- **State**: Manages `userInfo` and `auth_token` (cookie).
- **Initialization**: Client-side only (`import.meta.client`), triggered via `nextTick(initializeUser)` to avoid SSR hydration mismatches.
- **Access**: Use `storeToRefs(useCurrentUser())` for reactive `isLoggedIn` and `userInfo`.

## Page & Component Patterns

- **Article Detail**: `app/pages/articles/[articleId].vue`. Implements cache-then-fetch strategy (try `history.state` first).
- **Comments**: `app/components/article/Comments.vue`.
  - Uses `useAsyncData` keyed by `article-comments-${articleId}`.
  - Fetches user info separately via `getUsersBriefByIds` to populate `UserPopoverCard`.
  - Gates actions (post, delete) with `isLoggedIn` check.
- **User Pages**: `app/pages/user/` and `app/components/user/`.
- **Modals**: Use `DeleteConfirmModal.vue` for destructive actions.

## UI Conventions

- **Library**: Nuxt UI. Use components like `UCard`, `UButton`, `UInput`, `UModal`, `USkeleton`.
- **Icons**: Use Lucide icons via `i-lucide-*` class (e.g., `i-lucide-trash-2`, `i-lucide-log-in`).
- **Feedback**: Use `useToast().add({ title, description?, color })`.
  - Colors: `success`, `error`, `warning`, `neutral`.
- **Theme**: Dark mode supported via `useColorMode`. Components should use Tailwind `dark:` modifiers.

## Types & Utilities

- **Global Types**: `shared/types/*.d.ts` (e.g., `ApiResponse`, `User`, `Article`). Prefer ambient types over manual imports.
- **Error Handling**: `ApiError` (`shared/types/ApiError.ts`) is thrown by API wrappers when `!response.success`.
- **Date Formatting**: Use `shared/utils/date.ts` or `toLocaleString` for display.

## Dev Workflow

- **Package Manager**: `pnpm`.
- **Dev Server**: `pnpm dev --host --dotenv .env.development`.
- **Build**: `pnpm build --dotenv .env.production`.
- **Lint/Format**: `pnpm lint`, `pnpm format`.
- **Type Check**: `pnpm typecheck` (runs `nuxt prepare` + `vue-tsc`).

## SEO & Meta

- **Composable**: `useSeo()` (`app/composables/useSeo.ts`) for setting title, meta tags, OG, and structured data.
- **Sitemap**: Generated at build time via `@nuxtjs/sitemap`.
