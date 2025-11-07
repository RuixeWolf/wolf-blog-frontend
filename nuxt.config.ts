import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-11-07',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxthub/core',
    '@nuxtjs/sitemap'
  ],
  css: ['~/assets/css/main.css', 'md-editor-v3/lib/style.css'],
  ui: { fonts: false },
  icon: {
    customCollections: [
      {
        prefix: 'app-icons',
        dir: './app/assets/icons'
      }
    ]
  },

  // 开发服务器配置
  devServer: {
    host: '0.0.0.0'
  },

  // 运行时配置
  runtimeConfig: {
    public: {
      /** API 基础路径 */
      apiBase: '',
      /** 浏览器客户端 API 基础路径（优先级高于 apiBase） */
      apiBaseClient: '',
      /** SSR 服务端 API 基础路径（优先级高于 apiBase） */
      apiBaseServer: '',
      /** 网站 URL */
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://wolfblog.cn'
    }
  },

  // Sitemap 配置
  sitemap: {
    exclude: ['/user/settings', '/user/login', '/user/register', '/articles/edit/**'],
    defaults: {
      changefreq: 'daily',
      priority: 1,
      lastmod: new Date().toISOString()
    }
  }
})
