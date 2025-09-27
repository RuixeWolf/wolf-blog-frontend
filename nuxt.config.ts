// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/ui', '@pinia/nuxt', '@vueuse/nuxt', '@nuxthub/core'],
  css: ['~/assets/css/main.css', 'md-editor-v3/lib/style.css'],
  runtimeConfig: {
    public: {
      /** API 基础路径 */
      apiBase: '',
      /** 浏览器客户端 API 基础路径（优先级高于 apiBase） */
      apiBaseClient: '',
      /** SSR 服务端 API 基础路径（优先级高于 apiBase） */
      apiBaseServer: ''
    }
  },
  ui: { fonts: false }
})
