import { ApiError } from '~~/shared/types/ApiError'

/** 获取当前登录用户是否点赞指定文章 */
export async function getArticleSelfLikeStatus(
  articleId: Article.ArticleInfo['id']
): Promise<boolean> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<boolean>>(`/article/like/${articleId}`, {
    method: 'GET'
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 点赞指定文章 */
export async function likeArticle(articleId: Article.ArticleInfo['id']): Promise<void> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<void>>(`/article/like/${articleId}`, {
    method: 'POST'
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 取消点赞指定文章 */
export async function unlikeArticle(articleId: Article.ArticleInfo['id']): Promise<void> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<void>>(`/article/like/${articleId}`, {
    method: 'DELETE'
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}
