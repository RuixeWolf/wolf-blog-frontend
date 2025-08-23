import type { UseFetchOptions } from 'nuxt/app'

// 推荐使用：专门用于处理 ApiResponse 的版本
export function useApi<T>(
  url: string | (() => string),
  options?: Omit<UseFetchOptions<ApiResponse<T>>, 'transform'>
) {
  const fetchResult = useFetch<ApiResponse<T>>(url, {
    ...options,
    $fetch: useNuxtApp().$api as typeof $fetch
  })

  return {
    ...fetchResult,
    success: computed(() => fetchResult.data.value?.success ?? false),
    code: computed(() => fetchResult.data.value?.code ?? 'UNKNOWN'),
    message: computed(() => fetchResult.data.value?.message ?? '未知错误'),
    data: computed(() => fetchResult.data.value?.data ?? (null as T | null))
  }
}

// 备用版本：如果你需要完整的响应数据
export function useApiRaw<T>(
  url: string | (() => string),
  options?: UseFetchOptions<ApiResponse<T>>
) {
  return useFetch<ApiResponse<T>>(url, {
    ...options,
    $fetch: useNuxtApp().$api as typeof $fetch
  })
}
