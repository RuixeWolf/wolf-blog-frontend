/** 文章标签相关 API */

/** 创建标签 */
export async function createTag(data: Article.CreateTagRequest): Promise<Article.Tag> {
  const { $api } = useNuxtApp()
  const body = { name: String(data.name) }
  const response = await $api<ApiResponse<Article.Tag>>('/article/tag', {
    method: 'POST',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 全量更新标签 */
export async function putTag(data: Article.PutTagRequest): Promise<Article.Tag> {
  const { $api } = useNuxtApp()
  const body = { id: Number(data.id), name: String(data.name) }
  const response = await $api<ApiResponse<Article.Tag>>('/article/tag', {
    method: 'PUT',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 批量删除标签 */
export async function deleteTags(data: Article.DeleteTagsRequest): Promise<void> {
  const { $api } = useNuxtApp()
  const body = { ids: Array.isArray(data.ids) ? data.ids.map((id) => Number(id)) : [] }
  const response = await $api<ApiResponse<void>>('/article/tag', {
    method: 'DELETE',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}
