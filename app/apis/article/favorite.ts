/** 收藏指定文章 */
export async function favoriteArticle(articleId: Article.ArticleInfo['id']): Promise<void> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<void>>(`/article/favorite/${articleId}`, {
    method: 'POST'
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 取消收藏指定文章 */
export async function unfavoriteArticle(articleId: Article.ArticleInfo['id']): Promise<void> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<void>>(`/article/favorite/${articleId}`, {
    method: 'DELETE'
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}
