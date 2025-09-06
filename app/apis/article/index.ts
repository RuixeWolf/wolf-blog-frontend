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
  const body = {
    title: String(data.title),
    primary: String(data.primary),
    content: String(data.content),
    partitionId: Number(data.partitionId),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    comUseTags: Array.isArray(data.comUseTags) ? data.comUseTags.map(Number) : [],
    visibility: Number(data.visibility) as 0 | 1
  }
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
  const body = {
    id: Number(data.id),
    title: data.title === undefined ? undefined : String(data.title),
    primary:
      data.primary === undefined ? undefined : data.primary === null ? null : String(data.primary),
    content:
      data.content === undefined ? undefined : data.content === null ? null : String(data.content),
    partitionId:
      data.partitionId === undefined
        ? undefined
        : data.partitionId === null
          ? null
          : Number(data.partitionId),
    tags:
      data.tags === undefined ? undefined : Array.isArray(data.tags) ? data.tags.map(String) : [],
    comUseTags:
      data.comUseTags === undefined
        ? undefined
        : Array.isArray(data.comUseTags)
          ? data.comUseTags.map(Number)
          : [],
    visibility: data.visibility === undefined ? undefined : (Number(data.visibility) as 0 | 1)
  }
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
