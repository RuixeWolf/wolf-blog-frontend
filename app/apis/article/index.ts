import { ApiError } from '~~/shared/types/ApiError'
import { filterUndefinedFields, optionalField } from '~~/shared/utils/data-process'

/** 查询文章列表 */
export async function queryArticles(
  query: Article.ArticleListQuery = {}
): Promise<Article.ArticleQueryResult> {
  const { $api } = useNuxtApp()
  const body = filterUndefinedFields({
    id: optionalField(query.id, Number),
    title: optionalField(query.title, String),
    content: optionalField(query.content, String),
    authorId: optionalField(query.authorId, Number),
    partitionId: optionalField(query.partitionId, Number),
    visibility: optionalField(query.visibility, Number) as 0 | 1 | undefined,
    postStart: optionalField(query.postStart, String),
    postEnd: optionalField(query.postEnd, String),
    highlight: optionalField(query.highlight, Boolean),
    sort: optionalField(query.sort, (sort: Article.OrderField[]) =>
      Array.isArray(sort)
        ? sort.map((item) =>
            filterUndefinedFields({
              field: String(item.field),
              isAsc: optionalField(item.isAsc, Boolean),
              missing: optionalField(item.missing, String)
            })
          )
        : []
    ),
    pageNumber: optionalField(query.pageNumber, Number),
    pageSize: optionalField(query.pageSize, Number)
  })
  const response = await $api<ApiResponse<Article.ArticleQueryResult>>('/article/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/nullable+json' },
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

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
  const body = filterUndefinedFields({
    title: String(data.title),
    primary: optionalField(data.primary, String),
    content: String(data.content),
    partitionId: optionalField(data.partitionId, Number),
    tags: optionalField(data.tags, (tags) => (Array.isArray(tags) ? tags.map(String) : null)),
    comUseTags: optionalField(data.comUseTags, (comUseTags) =>
      Array.isArray(comUseTags) ? comUseTags.map(Number) : null
    ),
    visibility: optionalField(data.visibility, Number) as 0 | 1 | undefined
  })
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
  const body = filterUndefinedFields({
    id: Number(data.id),
    title: optionalField(data.title, String),
    primary: optionalField(data.primary, String),
    content: optionalField(data.content, String),
    partitionId: optionalField(data.partitionId, Number),
    tags: optionalField(data.tags, (tags) => (Array.isArray(tags) ? tags.map(String) : [])),
    comUseTags: optionalField(data.comUseTags, (comUseTags) =>
      Array.isArray(comUseTags) ? comUseTags.map(Number) : []
    ),
    visibility: optionalField(data.visibility, Number) as 0 | 1
  })
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

// 导出文章评论相关 API
export * from './comment'
// 导出文章分区相关 API
export * from './partition'
// 导出文章标签相关 API
export * from './tag'
