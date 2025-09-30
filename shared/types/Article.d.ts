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
    /** 浏览量 */
    views: number
    /** 作者用户ID */
    authorId: number
    /** 文章发布时间 */
    postTime: string
    /**
     * 可见性
     * - `0` - 公开
     * - `1` - 私密
     */
    visibility: 0 | 1
  }

  /** 文章详情 */
  interface ArticleDetail extends ArticleInfo {
    /** 文章正文内容 */
    content: string
    /** 文章所属分区ID */
    partitionId: number | null
    /** 文章标签列表 */
    tags: string[] | null
    /** 常用标签 ID 列表 */
    comUseTags: number[] | null
  }

  /** 文章列表 */
  type ArticleList = ArticleInfo[]

  /** 排序字段定义 */
  interface OrderField {
    /** 排序字段名 */
    field: string
    /** 是否升序 */
    isAsc?: boolean
    /** 缺失值处理策略 */
    missing?: string
  }

  /** 查询文章列表参数 */
  interface ArticleListQuery extends Partial<ApiPageRequest> {
    /** 文章 ID */
    id?: number
    /** 标题关键字 */
    title?: string
    /** 内容关键字（高亮时返回全文） */
    content?: string
    /** 作者 ID */
    authorId?: number
    /** 分区 ID */
    partitionId?: number
    /** 可见性 */
    visibility?: 0 | 1
    /** 发布时间开始 */
    postStart?: string
    /** 发布时间结束 */
    postEnd?: string
    /** 是否启用高亮 */
    highlight?: boolean
    /** 排序字段 */
    sort?: OrderField[]
  }

  /** 文章查询结果记录 */
  type ArticleQueryRecord = ArticleInfo | ArticleDetail

  /** 文章查询结果 */
  type ArticleQueryResult = ApiPageData<ArticleQueryRecord>

  /** 创建文章请求数据 */
  type CreateArticleRequest = Pick<ArticleDetail, 'title' | 'primary' | 'content'> &
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

  /** 文章分区 */
  interface Partition {
    /** 分区 ID */
    id: number
    /** 分区名称 */
    name: string
    /**
     * 可见性
     * - `0` - 公开
     * - `1` - 私密
     */
    visibility: number
    /** 排序 */
    order: number
    /** 子分区 */
    children: Partition[]
  }

  /** 创建文章分区请求数据 */
  type CreatePartitionRequest = Pick<Partition, 'name'> &
    Partial<Pick<Partition, 'visibility' | 'order'>> & {
      /** 父分区 ID */
      parentId?: number
    }

  /** 增量更新文章分区请求数据 */
  type PatchPartitionRequest = Pick<Partition, 'id'> &
    Partial<Pick<Partition, 'name' | 'visibility' | 'order'>> & {
      /** 父分区 ID */
      parentId?: number
    }

  /** 文章评论 */
  interface Comment {
    /** 评论 ID */
    id: number
    /** 评论用户 ID */
    userId: number
    /** 评论所属文章 ID */
    articleId?: number
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
    articleId?: number
  } & Partial<Pick<Comment, 'userId' | 'replyId'>> &
    Partial<ApiPageRequest>

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

  /** 文章暂存请求数据 */
  type DraftRequest = Pick<ArticleDetail, 'id' | 'title' | 'content'> &
    Partial<Pick<ArticleDetail, 'primary' | 'partitionId' | 'tags' | 'comUseTags' | 'visibility'>>

  /** 文章收藏关联信息 */
  interface ArticleFavoriteRecord {
    /** 文章 ID */
    articleId: number
    /** 收藏夹 ID */
    favoriteId: number
    /** 收藏时间 */
    favoriteDate: string
  }
}
