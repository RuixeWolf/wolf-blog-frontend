import { unref, watch } from 'vue'
import type { MaybeRef } from 'vue'
import type { Link, Meta } from '@unhead/vue'
import { useHead } from '#imports'

/**
 * SEO 数据接口
 */
export interface SeoData {
  /** 页面标题 */
  title: string
  /** 页面描述 */
  description?: string
  /** 关键词 */
  keywords?: string
  /** 页面类型，默认为 'website' */
  type?: 'website' | 'article'
  /** 文章作者 */
  author?: string
  /** 文章发布时间 */
  publishedTime?: string | Date
  /** 文章最后修改时间 */
  modifiedTime?: string | Date
  /** 文章所属类别 */
  section?: string
  /** 文章标签 */
  tags?: string[]
  /** 规范链接 */
  canonical?: string
  /** OG 图片 */
  image?: string
  /** 页面 URL */
  url?: string
}

/**
 * 设置页面的 SEO 信息，包括 meta 标签和结构化数据。
 * @param seoData SEO 数据
 */
export function useSeo(seoData: MaybeRef<SeoData>) {
  watch(
    () => unref(seoData),
    (data) => {
      if (!data) return

      const {
        public: { siteUrl }
      } = useRuntimeConfig()
      const route = useRoute()

      const meta: Meta[] = [
        { property: 'og:type', content: data.type || 'website' },
        { property: 'og:title', content: data.title },
        { name: 'twitter:title', content: data.title },
        { property: 'og:url', content: data.url || `${siteUrl}${route.fullPath}` },
        { property: 'og:image', content: data.image || `${siteUrl}/og-image.jpg` },
        { name: 'twitter:card', content: 'summary_large_image' }
      ]

      if (data.description) {
        meta.push({ name: 'description', content: data.description })
        meta.push({ property: 'og:description', content: data.description })
        meta.push({ name: 'twitter:description', content: data.description })
      }
      if (data.keywords) {
        meta.push({ name: 'keywords', content: data.keywords })
      }
      if (data.author) {
        meta.push({ name: 'author', content: data.author })
        if (data.type === 'article') {
          meta.push({ property: 'article:author', content: data.author })
        }
      }
      if (data.publishedTime) {
        const published = new Date(data.publishedTime).toISOString()
        meta.push({ property: 'article:published_time', content: published })
        meta.push({ property: 'og:article:published_time', content: published })
      }
      if (data.modifiedTime) {
        const modified = new Date(data.modifiedTime).toISOString()
        meta.push({ property: 'article:modified_time', content: modified })
        meta.push({ property: 'og:article:modified_time', content: modified })
      }
      if (data.section) {
        meta.push({ property: 'article:section', content: data.section })
      }
      if (data.tags) {
        data.tags.forEach((tag: string) => {
          meta.push({ property: 'article:tag', content: tag })
        })
      }

      const links: Link[] = []
      if (data.canonical) {
        links.push({ rel: 'canonical', href: data.canonical })
      }

      useHead({
        title: data.title,
        meta,
        link: links
      })
    },
    { immediate: true, deep: true }
  )
}
