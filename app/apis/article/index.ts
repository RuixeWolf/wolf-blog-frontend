/** 获取文章详情 */
export async function getArticleDetail(
  articleId: Article.ArticleDetail['id']
): Promise<Article.ArticleDetail> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<Article.ArticleDetail>>(`/article/${articleId}`)
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 创建文章 */
export async function createArticle(
  data: Article.CreateArticleRequest
): Promise<Article.ArticleDetail> {
  const { $api } = useNuxtApp()
  const body = filterUndefinedFields({
    title: String(data.title),
    primary: String(data.primary),
    content: String(data.content),
    partitionId: optionalField(data.partitionId, Number),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    comUseTags: Array.isArray(data.comUseTags) ? data.comUseTags.map(Number) : [],
    visibility: Number(data.visibility) as 0 | 1
  })
  const response = await $api<ApiResponse<Article.ArticleDetail>>('/article', {
    method: 'POST',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 增量更新文章 */
export async function patchArticle(
  data: Article.PatchArticleRequest
): Promise<Article.ArticleDetail> {
  const { $api } = useNuxtApp()
  const body = filterUndefinedFields({
    id: Number(data.id),
    title: optionalField(data.title, String),
    primary: optionalField(data.primary, String),
    content: optionalField(data.content, String),
    partitionId: optionalField(data.partitionId, Number),
    tags: optionalField(data.tags, (tags) => (Array.isArray(tags) ? tags.map(String) : [])),
    comUseTags: optionalField(data.comUseTags, (comUseTags) =>
      Array.isArray(comUseTags) ? comUseTags.map(Number) : []
    ),
    visibility: optionalField(data.visibility, Number) as 0 | 1
  })
  const response = await $api<ApiResponse<Article.ArticleDetail>>('/article', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/nullable+json' },
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 删除文章 */
export async function deleteArticle(articleId: Article.ArticleDetail['id']): Promise<void> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<void>>(`/article/${articleId}`, {
    method: 'DELETE'
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

// 导出文章评论相关 API
export * from './comment'
// 导出文章标签相关 API
export * from './tag'
