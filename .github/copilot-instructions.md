# Wolf Blog Frontend – AI Coding Instructions

## Architecture & Layout

- **Framework**: Nuxt 4 + TypeScript + Nuxt UI (Tailwind CSS).
- **Directory Structure**:
  - `app/`: Main Nuxt application source.
    - `apis/`: Imperative API wrapper functions (e.g., `user.ts`, `article/`).
    - `components/`: Vue components, grouped by feature (e.g., `article/`, `user/`).
    - `composables/`: Auto-imported composables (e.g., `useApi.ts`, `useSeo.ts`).
    - `layouts/`, `pages/`, `plugins/`, `stores/`: Standard Nuxt directories.
  - `shared/`: Shared code outside `app/` (types, utils, constants).
  - `server/`: Nitro server routes (if applicable).
- **Global Styles**: `app/assets/css/main.css` (Tailwind imports).

## Data & API

- **Core Plugin**: `app/plugins/api.ts` configures `$fetch`.
  - **Auth**: Automatically injects `Authorization` header from `auth_token` cookie.
  - **Error Handling**: Intercepts 4xx/5xx responses. Returns `ApiResponse` with `success: false` instead of throwing, unless using `useApi` which may handle it differently.
  - **Redirects**: Handles `UN_LOGIN` / `AUTH_FAILED` by clearing user state.
- **Composables**:
  - `useApi<T>` (`app/composables/useApi.ts`): Wrapper around `useFetch` typed with `ApiResponse<T>`. Provides reactive `success`, `code`, `message`, `data`.
  - `useApiRaw<T>`: Returns the raw `useFetch` result.
- **Imperative Calls**: Defined in `app/apis/**`.
  - Use `useNuxtApp().$api` for direct calls.
  - Throw `ApiError` (`shared/types/ApiError.ts`) when `!response.success`.
  - Use `filterUndefinedFields` and `optionalField` (`shared/utils/data-process.ts`) to clean request bodies.
- **Component Fetching**:
  - Use `useAsyncData` with unique keys (e.g., `article-comments-${id}`).
  - Watch props/refs to trigger refetches: `{ watch: [() => props.id] }`.

## Auth & User State

- **Store**: `useCurrentUser` (`app/stores/user.ts`).
- **State**: `userInfo` (reactive) and `auth_token` (cookie).
- **Initialization**:
  - Client-side only (`import.meta.client`).
  - Uses `nextTick(initializeUser)` to prevent hydration mismatches.
- **Access**: `const { isLoggedIn, userInfo } = storeToRefs(useCurrentUser())`.

## UI Conventions

- **Library**: Nuxt UI (`@nuxt/ui`).
  - Components: `UCard`, `UButton`, `UInput`, `UTextarea`, `UModal`, `USkeleton`, `UBadge`, `UAvatar`.
  - Icons: Use Lucide icons via `i-lucide-*` class (e.g., `i-lucide-trash-2`, `i-lucide-log-in`).
- **Feedback**:
  - `useToast().add({ title, description?, color: 'success' | 'error' | 'warning' | 'neutral' })`.
- **Modals**: Use `DeleteConfirmModal.vue` for destructive actions.
- **Theme**: Dark mode supported. Use Tailwind `dark:` modifiers.

## Types & Utilities

- **Locations**:
  - `shared/types/*.d.ts`: Global types (e.g., `ApiResponse`, `User`, `Article`).
  - `shared/utils/`: Utility functions (e.g., `date.ts`, `data-process.ts`).
- **Date Formatting**: Use `shared/utils/date.ts` or `toLocaleString` (e.g., `zh-CN`).

## Dev Workflow

- **Package Manager**: `pnpm`.
- **Commands**:
  - Dev: `pnpm dev --host --dotenv .env.development`
  - Build: `pnpm build --dotenv .env.production`
  - Type Check: `pnpm typecheck` (runs `nuxt prepare` + `vue-tsc`)
  - Lint & Format: `pnpm format-lint` (runs `prettier` + `eslint`)

## SEO

- **Composable**: `useSeo()` (`app/composables/useSeo.ts`).
- **Usage**: Call in `setup()` to set title, meta tags, OG data, and structured data.
