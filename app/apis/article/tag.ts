import { ApiError } from '../../../shared/types/ApiError'

/** 文章标签相关 API */

/**
 * 获取常用标签列表。
 *
 * @returns {Promise<Article.Tag[]>} 常用标签实体数组。
 * @throws {ApiError} 当接口返回非成功响应时抛出。
 */
export async function getTags(): Promise<Article.Tag[]> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<Article.Tag[]>>('/tag')
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 创建常用标签 */
export async function createTag(data: Article.CreateTagRequest): Promise<Article.Tag> {
  const { $api } = useNuxtApp()
  const body = { name: String(data.name) }
  const response = await $api<ApiResponse<Article.Tag>>('/tag', {
    method: 'POST',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 全量更新常用标签 */
export async function putTag(data: Article.PutTagRequest): Promise<Article.Tag> {
  const { $api } = useNuxtApp()
  const body = { id: Number(data.id), name: String(data.name) }
  const response = await $api<ApiResponse<Article.Tag>>('/tag', {
    method: 'PUT',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 批量删除常用标签 */
export async function deleteTags(data: Article.DeleteTagsRequest): Promise<void> {
  const { $api } = useNuxtApp()
  const body = { ids: Array.isArray(data.ids) ? data.ids.map((id) => Number(id)) : [] }
  const response = await $api<ApiResponse<void>>('/tag', {
    method: 'DELETE',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}
