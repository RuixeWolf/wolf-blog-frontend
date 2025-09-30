import { ApiError } from '../../shared/types/ApiError'
import { filterUndefinedFields, optionalField } from '../../shared/utils/data-process'

/** 获取指定用户的收藏夹列表 */
export async function getUserFavorites(userId: number): Promise<Favorite.FavoriteFolderList> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<Favorite.FavoriteFolderList>>(`/favorites/${userId}`, {
    method: 'GET'
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 获取当前用户的默认收藏夹 */
export async function getDefaultFavorite(): Promise<Favorite.FavoriteFolder> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<Favorite.FavoriteFolder>>('/favorites', {
    method: 'GET'
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 新建收藏夹 */
export async function createFavoriteFolder(
  data: Favorite.CreateFavoriteFolder
): Promise<Favorite.FavoriteFolderList> {
  const { $api } = useNuxtApp()
  const body = filterUndefinedFields({
    title: String(data.title),
    visibility: optionalField(data.visibility, Number) as 0 | 1,
    isDefault: optionalField(data.isDefault, Number)
  })
  const response = await $api<ApiResponse<Favorite.FavoriteFolderList>>('/favorites', {
    method: 'POST',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 更新收藏夹信息 */
export async function patchFavoriteFolder(
  data: Favorite.PatchFavoriteFolder
): Promise<Favorite.FavoriteFolder> {
  const { $api } = useNuxtApp()
  const body = filterUndefinedFields({
    id: Number(data.id),
    title: optionalField(data.title, String),
    visibility: optionalField(data.visibility, Number) as 0 | 1,
    isDefault: optionalField(data.isDefault, Number)
  })
  const response = await $api<ApiResponse<Favorite.FavoriteFolder>>('/favorites', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/nullable+json' },
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 删除收藏夹 */
export async function deleteFavoriteFolder(
  favoritesId: Favorite.FavoriteFolder['id']
): Promise<Favorite.FavoriteFolderList> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<Favorite.FavoriteFolderList>>(
    `/favorites/${favoritesId}`,
    {
      method: 'DELETE'
    }
  )
  if (!response.success) throw new ApiError(response)
  return response.data
}

export { getFavoriteArticles } from './article/favorite'
