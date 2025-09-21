// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/ui', '@pinia/nuxt', '@vueuse/nuxt', '@nuxthub/core'],
  css: ['~/assets/css/main.css', 'md-editor-v3/lib/style.css'],
  runtimeConfig: {
    public: {
      /** 浏览器客户端 API 基础路径 */
      apiBaseClient: '',
      /** SSR 服务端 API 基础路径 */
      apiBaseServer: ''
    }
  },
  ui: { fonts: false }
})
