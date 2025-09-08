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
    visibility: number
    /**
     * 是否默认收藏夹
     * - `0` - 否
     * - `1` - 是
     */
    isDefault: number
  }

  /** 修改收藏夹 */
  type PatchFavoriteFolder = Pick<FavoriteFolder, 'id'> & Partial<Omit<FavoriteFolder, 'id'>>
}
