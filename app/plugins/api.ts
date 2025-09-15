export default defineNuxtPlugin((nuxtApp) => {
  /** Nuxt 运行时配置 */
  const runtimeConfig = useRuntimeConfig()

  /** API 请求实例 */
  const api = $fetch.create({
    baseURL: runtimeConfig.public.apiBase,
    async onRequest({ options }) {
      // 从 Cookie 获取 Token 并添加至请求头
      const authToken = useCookie('auth_token')
      if (authToken.value) options.headers.set('Authorization', authToken.value)
    },
    async onResponseError({ response }) {
      // 这里处理网络错误或其他异常情况
      if (import.meta.client) {
        console.log('Error API response:', response)
      }

      const data = response._data as ApiResponse<null> | undefined

      // Token 过期时跳转登录页
      if (data && ['UN_LOGIN', 'AUTH_FAILED'].includes(data?.code)) {
        await nuxtApp.runWithContext(() => {
          const currentUser = useCurrentUser()
          currentUser.clearUserInfo()
        })
      }

      // 对于业务错误（4xx, 5xx），不抛出异常，而是返回标准的 ApiResponse 格式
      // 这样下级调用者可以正常获取到错误信息
      if (response.status >= 400) {
        // 如果后端返回的已经是 ApiResponse 格式，直接返回
        if (response._data && typeof response._data === 'object' && 'success' in response._data) {
          return response._data
        }

        // 否则包装成 ApiResponse 格式
        const errorResponse: ApiResponse<null> = {
          success: false,
          code: `HTTP_${response.status}`,
          message: response.statusText || `HTTP ${response.status} 错误`,
          data: null
        }

        // 重要：不抛出异常，而是返回错误响应
        return errorResponse
      }
    }
  })

  // 通过 useNuxtApp().$api 暴露
  return {
    provide: { api }
  }
})
