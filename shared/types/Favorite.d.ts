/** 文章收藏 */
declare namespace Favorite {
  /** 收藏夹 */
  interface FavoriteFolder {
    /** ID */
    id: number
    /** 标题 */
    title: string
    /**
     * 可见性
     * - `0` - 公开
     * - `1` - 私密
     */
    visibility: 0 | 1
    /**
     * 是否默认收藏夹
     * - `0` - 否
     * - `1` - 是
     */
    isDefault: number
  }

  /** 创建收藏夹请求数据 */
  type CreateFavoriteFolder = Pick<FavoriteFolder, 'title'> & Partial<Omit<FavoriteFolder, 'id'>>

  /** 增量更新收藏夹请求数据 */
  type PatchFavoriteFolder = Pick<FavoriteFolder, 'id'> & Partial<Omit<FavoriteFolder, 'id'>>

  /** 添加收藏文章请求数据 */
  type AddFavoriteArticle = {
    /** 文章 ID */
    articleId: Article.ArticleDetail['id']
    /** 收藏夹 ID */
    favoritesId: Favorite.FavoriteFolder['id']
  }

  /** 获取收藏夹的文章列表请求数据 */
  type FavoriteArticleListQuery = Partial<ApiPageRequest> & {
    /** 收藏夹 ID */
    favoritesId: Favorite.FavoriteFolder['id']
  }

  /** 收藏记录 */
  interface FavoriteArticleRecord {
    /** 文章 ID */
    articleId: number
    /** 收藏夹 ID */
    favoritesId: number
    /** 收藏时间 */
    favoriteDate: string
  }

  /** 收藏夹集合 */
  type FavoriteFolderList = FavoriteFolder[]

  /** 收藏夹文章分页结果 */
  type FavoriteArticlePage = ApiPageData<Article.ArticleInfo>
}
