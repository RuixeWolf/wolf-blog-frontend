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
    /**
     * 可见性
     * - `0` - 公开
     * - `1` - 私密
     */
    visibility: number
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
  type ArticleListQuery = Partial<
    ApiListRequest &
      Pick<ArticleDetail, 'id' | 'title' | 'authorId' | 'partitionId'> & {
        /** 发布时间开始 */
        postStart?: string
        /** 发布时间结束 */
        postEnd?: string
      }
  >

  /** 创建文章请求数据 */
  type CreateArticleRequest = Omit<ArticleDetail, 'id' | 'authorId' | 'postTime'>

  /** 增量更新文章请求数据 */
  type PatchArticleRequest = Pick<ArticleDetail, 'id'> &
    Partial<Omit<ArticleDetail, 'id' | 'authorId' | 'postTime'>>

  /** 文章评论 */
  interface Comment {
    /** 评论 ID */
    id: number
    /** 评论用户 ID */
    userId: number
    /** 回复的评论 ID */
    replyId: number | null
    /** 评论内容 */
    content: string
    /** 评论发布时间 */
    commentTime: string
  }

  /** 评论列表 */
  type CommentList = Comment[]

  /** 获取文章评论查询参数 */
  type CommentListQuery = {
    /** 文章 ID */
    articleId: number
  } & Partial<Pick<Comment, 'userId' | 'replyId'>>

  /** 评论删除请求数据 */
  type DeleteCommentRequest = {
    /** 评论 ID */
    commentId: number
    /** 文章 ID */
    articleId: number
  }
}
