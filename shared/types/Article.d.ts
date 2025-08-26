/** 文章相关类型定义 */
declare namespace Article {
  /** 文章信息 */
  interface ArticleInfo {
    /** 文章唯一标识符 */
    id: number
    /** 文章标题 */
    title: string
    /** 文章摘要/主要内容概述 */
    primary: string
    /** 作者用户ID */
    authorId: number
    /** 文章发布时间 */
    postTime: string
  }

  /** 文章详情 */
  interface ArticleDetail extends ArticleInfo {
    /** 文章正文内容 */
    content: string
    /** 文章所属分区ID */
    partitionId: number
    /** 文章标签列表 */
    tags: string[]
    /** 常用标签 ID 列表 */
    comUseTags: number[]
  }

  /** 文章列表 */
  type ArticleList = ArticleInfo[]

  /** 查询文章列表参数 */
  type QueryArticleListParams = Partial<
    ApiListRequest &
      Pick<ArticleDetail, 'id' | 'title' | 'authorId' | 'partitionId'> & {
        /** 发布时间开始 */
        postStart?: string
        /** 发布时间结束 */
        postEnd?: string
      }
  >
}
