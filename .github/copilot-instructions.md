# Wolf Blog Frontend - AI Coding Instructions

## Project Overview

This is a Nuxt 3 blog frontend with TypeScript, featuring user authentication, article management, and a custom API layer. The architecture emphasizes type safety, composable patterns, and a standardized API response format.

## Core Architecture Patterns

### API Layer (`app/plugins/api.ts` + `app/composables/useApi.ts`)

- **Custom $fetch instance**: Use `useNuxtApp().$api` for all API calls
- **Standardized responses**: All APIs return `ApiResponse<T>` format with `success`, `code`, `message`, `data`
- **Auto-authentication**: Tokens from `auth_token` cookie are automatically injected
- **Error handling**: Business errors (4xx/5xx) are wrapped, not thrown - check `response.success`
- **Usage pattern**: Always use `useApi()` composable for reactive API calls in components

```typescript
// Correct API usage pattern
const { data, success, message, refresh } = useApi<ApiListData<Article.ArticleInfo>>(
  '/article/query',
  {
    method: 'POST',
    body: queryParams
  }
)
```

### State Management (Pinia)

- **Single user store**: `useCurrentUser()` handles auth state, login/logout, token management
- **Cookie-based auth**: Uses `useCookie('auth_token')` for persistent authentication
- **Auto-initialization**: User state loads automatically on client-side mount
- **Clear separation**: Auth logic isolated in store, not scattered across components

### Type System (`shared/types/`)

- **Namespace organization**: Types grouped by domain (`Article.*`, `User.*`)
- **API request/response types**: Separate types for requests vs. responses vs. list queries
- **Global declarations**: Use `declare interface` for `ApiResponse<T>` and common types
- **Utility functions**: `optionalField()` and `filterUndefinedFields()` for API data processing

## File Organization Conventions

### Directory Structure

```
app/
├── apis/           # API layer functions (one file per domain)
├── components/     # Reusable Vue components
├── composables/    # Custom composables and utilities
├── pages/          # File-based routing (Nuxt convention)
├── plugins/        # Nuxt plugins (api.ts configures $fetch)
└── stores/         # Pinia stores (user.ts for auth)

shared/
├── types/          # TypeScript declarations
├── utils/          # Pure utility functions
└── constants/      # Shared constants
```

### Component Patterns

- **Reactive props**: Use `reactive()` for query objects that change frequently
- **Watch patterns**: Watch reactive props with `{ deep: true }` to trigger API refreshes
- **Conditional rendering**: Check API success state before rendering data
- **Search/filter**: Implement debounced search with `setTimeout()` pattern

## Development Workflows

### Running the Project

```bash
pnpm dev --host --dotenv .env.development  # Development with network access
pnpm build --dotenv .env.production        # Production build
pnpm typecheck                            # Type checking
```

### Code Quality

- **ESLint config**: Uses `@nuxt/eslint` with auto-fix on save
- **Prettier**: Configured with import sorting and Tailwind class sorting
- **Type checking**: Run `pnpm typecheck` before commits

## Key Integration Points

### Authentication Flow

1. Login via `userApi.login()` stores token in cookie
2. `api.ts` plugin auto-injects token in requests
3. Failed auth triggers `clearUserInfo()` and redirect
4. All auth state managed through `useCurrentUser()` store

### Article Management

- **List view**: `pages/index.vue` with filtering + `ArticleList.vue` component
- **Detail view**: `pages/articles/[articleId].vue` for individual articles
- **Edit flow**: `pages/articles/edit/[[articleId]].vue` for create/update
- **API pattern**: CRUD operations in `apis/article/index.ts`

### UI Framework

- **Nuxt UI**: Primary component library with custom theme in `app.config.ts`
- **Tailwind**: Utility-first styling with responsive design patterns
- **Icons**: Lucide icons via `@iconify-json/lucide` (use `i-lucide-*` format)

## Common Patterns to Follow

### API Error Handling

```typescript
// In API functions - throw ApiError for business logic
if (!response.success) throw new ApiError(response)

// In components - check success before using data
if (!success.value) {
  // Handle error state using message.value
}
```

### Reactive Data Patterns

```typescript
// Query objects that trigger API calls
const query = reactive<Article.ArticleListQuery>({ pageNumber: 1 })

// Watch for deep changes
watch(
  () => props.query,
  () => refresh(),
  { deep: true }
)
```

### Form Data Processing

```typescript
// Use utility functions for API body preparation
const body = filterUndefinedFields({
  title: String(data.title),
  content: optionalField(data.content, String),
  tags: optionalField(data.tags, (tags) => tags.map(String))
})
```

## Critical Dependencies

- **md-editor-v3**: Markdown editor for article content
- **@vueuse/nuxt**: Reactive utilities (heavily used)
- **zod**: Runtime validation (import as needed)
- **pnpm workspace**: Uses shameful hoisting for dependency management

When making changes, prioritize type safety, follow the established API patterns, and maintain consistency with the existing component structure.
