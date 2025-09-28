/** 获取文章分区列表 */
export async function getArticlePartitions(): Promise<Article.Partition[]> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<Article.Partition[]>>('/part')
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 创建文章分区 */
export async function createArticlePartition(
  data: Article.CreatePartitionRequest
): Promise<Article.Partition> {
  const { $api } = useNuxtApp()
  const body = filterUndefinedFields({
    name: String(data.name),
    visibility: optionalField(data.visibility, Number),
    order: optionalField(data.order, Number),
    parentId: optionalField(data.parentId, Number)
  })
  const response = await $api<ApiResponse<Article.Partition>>('/part', {
    method: 'POST',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 增量更新文章分区 */
export async function patchArticlePartition(
  data: Article.PatchPartitionRequest
): Promise<Article.Partition> {
  const { $api } = useNuxtApp()
  const body = filterUndefinedFields({
    id: Number(data.id),
    name: optionalField(data.name, String),
    visibility: optionalField(data.visibility, Number),
    order: optionalField(data.order, Number),
    parentId: optionalField(data.parentId, Number)
  })
  const response = await $api<ApiResponse<Article.Partition>>('/part', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/nullable+json' },
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 删除文章分区 */
export async function deleteArticlePartition(partitionId: Article.Partition['id']): Promise<void> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<void>>(`/part/${partitionId}`, {
    method: 'DELETE'
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/**
 * 批量删除文章分区
 * @description 删除指定分区 ID 下的所有分区
 */
export async function deleteArticlePartitionCascade(
  partitionId: Article.Partition['id']
): Promise<void> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<void>>(`/part/batch/${partitionId}`, {
    method: 'DELETE'
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}
