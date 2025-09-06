/** 文章可见性名称映射表 */
export const ARTICLE_VISIBILITY_NAME_MAP: Record<Article.ArticleInfo['visibility'], string> = {
  0: '公开',
  1: '私密'
}

/** 文章可见性选项表 */
export const ARTICLE_VISIBILITY_OPTIONS: Array<{
  value: Article.ArticleInfo['visibility']
  label: string
}> = Object.entries(ARTICLE_VISIBILITY_NAME_MAP).map(([value, label]) => ({
  value: Number(value),
  label
}))
