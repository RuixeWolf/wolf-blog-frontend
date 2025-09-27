/** 文章评论相关 API */

/** 获取文章评论列表 */
export async function getArticleComments(
  query: Article.CommentListQuery
): Promise<ApiListData<Article.Comment>> {
  const { $api } = useNuxtApp()
  const body = filterUndefinedFields({
    articleId: Number(query.articleId),
    userId: optionalField(query.userId, Number),
    replyId: optionalField(query.replyId, Number)
  })
  const response = await $api<ApiResponse<ApiListData<Article.Comment>>>('/article/comment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/nullable+json' },
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 新增文章评论 */
export async function createArticleComment(
  data: Article.CreateCommentRequest
): Promise<Article.Comment> {
  const { $api } = useNuxtApp()
  const body = filterUndefinedFields({
    articleId: Number(data.articleId),
    content: String(data.content),
    replyId: optionalField(data.replyId, Number)
  })
  const response = await $api<ApiResponse<Article.Comment>>('/article/comment/post', {
    method: 'POST',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 删除文章评论 */
export async function deleteArticleComment(data: Article.DeleteCommentRequest): Promise<void> {
  const { $api } = useNuxtApp()
  const body = filterUndefinedFields({
    commentId: Number(data.commentId),
    articleId: Number(data.articleId)
  })
  const response = await $api<ApiResponse<void>>('/article/comment', {
    method: 'DELETE',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}
