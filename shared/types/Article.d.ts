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
    tags: string[] | null
    /** 常用标签 ID 列表 */
    comUseTags: number[] | null
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
  type CreateArticleRequest = Pick<ArticleDetail, 'authorId' | 'title' | 'primary' | 'content'> &
    Partial<Pick<ArticleDetail, 'tags' | 'comUseTags' | 'visibility' | 'partitionId'>>

  /** 增量更新文章请求数据 */
  type PatchArticleRequest = Pick<ArticleDetail, 'id'> & Partial<CreateArticleRequest>

  /** 文章标签 */
  interface Tag {
    /** 标签 ID */
    id: number
    /** 标签名称 */
    name: string
  }

  /** 创建标签请求数据 */
  type CreateTagRequest = Pick<Tag, 'name'>

  /** 全量更新标签请求数据 */
  type PutTagRequest = Pick<Tag, 'id' | 'name'>

  /** 批量删除标签请求数据 */
  type DeleteTagsRequest = {
    /** 标签 ID 列表 */
    ids: Array<Tag['id']>
  }

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

  /** 创建评论请求数据 */
  type CreateCommentRequest = Pick<Comment, 'articleId' | 'content'> &
    Partial<Pick<Comment, 'replyId'>>

  /** 删除评论请求数据 */
  type DeleteCommentRequest = {
    /** 评论 ID */
    commentId: number
    /** 文章 ID */
    articleId: number
  }
}
