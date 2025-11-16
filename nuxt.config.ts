/// <reference types="./shared/types/type.d.ts" />
/// <reference types="./shared/types/Article.d.ts" />

import { defineNuxtConfig } from 'nuxt/config'
import { ofetch } from 'ofetch'

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
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://wolfblog.cn',
      /** 阿里云验证码前缀 */
      aliyunCaptchaPrefix: process.env.NUXT_PUBLIC_ALIYUN_CAPTCHA_PREFIX,
      /** 阿里云验证码场景 ID - 用户注册邮箱验证码 */
      aliyunCaptchaSceneIdEmailCode: process.env.NUXT_PUBLIC_ALIYUN_CAPTCHA_SCENE_ID_EMAIL_CODE
    }
  },
  // 应用配置
  app: {
    head: {
      meta: [
        {
          name: 'google-site-verification',
          content: 'NXfgjEswn0tQ1ObEiwXr5TvJkSLoLoORnRqs0d1yzzo'
        },
        { name: 'msvalidate.01', content: 'C946A40DA6A8822BEDC0C5463EEDB211' }
      ],
      script: [
        // 阿里云验证码配置
        {
          type: 'text/javascript',
          textContent: `window.AliyunCaptchaConfig = { region: 'cn', prefix: '${process.env.NUXT_PUBLIC_ALIYUN_CAPTCHA_PREFIX || ''}' };`
        },
        // 阿里云验证码脚本
        {
          type: 'text/javascript',
          src: 'https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js'
        }
      ]
    }
  },

  // Sitemap 配置
  sitemap: {
    exclude: ['/user/settings', '/user/login', '/user/register', '/articles/edit/**'],
    defaults: {
      changefreq: 'daily',
      priority: 1,
      lastmod: new Date()
    },
    urls: async () => {
      const articleList = await ofetch<ApiResponse<ApiPageData<Article.ArticleInfo>>>(
        `${process.env.NUXT_PUBLIC_API_BASE_SERVER || process.env.NUXT_PUBLIC_API_BASE}/article/query`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/nullable+json' },
          body: {
            pageSize: 1000, // 获取全量数据
            visibility: 0 // 仅公开文章
          }
        }
      )
      return (
        articleList?.data?.records?.map((article: Article.ArticleInfo) => ({
          loc: `/articles/${article.id}`,
          lastmod: new Date(article.editTime || article.postTime)
        })) || []
      )
    }
  }
})
