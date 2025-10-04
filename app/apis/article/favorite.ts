import { ApiError } from '~~/shared/types/ApiError'
import { filterUndefinedFields, optionalField } from '~~/shared/utils/data-process'

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
export async function favoriteArticle(data: Favorite.AddFavoriteArticle): Promise<void> {
  const { $api } = useNuxtApp()
  const body = {
    articleId: Number(data.articleId),
    favoritesId: Number(data.favoritesId)
  }
  const response = await $api<ApiResponse<void>>(`/article/favorite`, {
    method: 'POST',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 取消收藏指定文章 */
export async function unfavoriteArticle(data: Favorite.AddFavoriteArticle): Promise<void> {
  const { $api } = useNuxtApp()
  const body = {
    articleId: Number(data.articleId),
    favoritesId: Number(data.favoritesId)
  }
  const response = await $api<ApiResponse<void>>(`/article/favorite`, {
    method: 'DELETE',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 获取收藏夹下文章列表 */
export async function getFavoriteArticles(
  query: Favorite.FavoriteArticleListQuery
): Promise<Favorite.FavoriteArticlePage> {
  const { $api } = useNuxtApp()
  const body = filterUndefinedFields({
    favoritesId: Number(query.favoritesId),
    pageNumber: optionalField(query.pageNumber, Number),
    pageSize: optionalField(query.pageSize, Number)
  })
  const response = await $api<ApiResponse<Favorite.FavoriteArticlePage>>('/article/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/nullable+json' },
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}
