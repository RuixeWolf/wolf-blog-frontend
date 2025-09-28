/** 获取文章所属收藏夹列表 */
export async function getArticleFavorites(
  articleId: Article.ArticleDetail['id']
): Promise<Favorite.FavoriteFolder[]> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<Favorite.FavoriteFolder[]>>(
    `/article/favorite/${articleId}`
  )
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 收藏指定文章 */
export async function favoriteArticle(body: Favorite.AddFavoriteArticle): Promise<void> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<void>>(`/article/favorite`, {
    method: 'POST',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 取消收藏指定文章 */
export async function unfavoriteArticle(body: Favorite.AddFavoriteArticle): Promise<void> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<void>>(`/article/favorite`, {
    method: 'DELETE',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}
