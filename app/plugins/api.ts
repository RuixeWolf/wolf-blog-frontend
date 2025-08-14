export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: runtimeConfig.public.apiBaseUrl,
    // 自定义响应解析器，处理 ApiResponse 格式（TODO 可能使用其他方法）
    parseResponse: (responseText: string) => {
      const apiResponse = JSON.parse(responseText) as ApiResponse
      // 如果响应不成功，抛出 ApiError
      if (!apiResponse.success) throw new ApiError(apiResponse)
      // 如果成功，返回 data 字段
      return apiResponse.data
    },
    onRequest({ request: _request, options: _options, error: _error }) {
      // TODO 从 Cookie 获取 Token
      // if (session.value?.token) {
      //   // 注意：这依赖于 ofetch >= 1.4.0 - 你可能需要刷新你的 lockfile
      //   options.headers.set('Authorization', `Bearer ${session.value?.token}`)
      // }
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        await nuxtApp.runWithContext(() => navigateTo('/user/login'))
      }
    }
  })

  // 通过 useNuxtApp().$api 暴露
  return {
    provide: {
      api
    }
  }
})
