import type { MaybeRef } from 'vue'
import { favoriteArticle, getArticleFavorites, unfavoriteArticle } from '@/apis/article/favorite'
import { getDefaultFavorite, getUserFavorites } from '@/apis/favorite'

/**
 * 管理文章收藏状态的 Composable
 * @param articleId 文章 ID（支持 ref 或普通值）
 * @returns 收藏状态、文件夹列表、操作方法等
 */
export function useArticleFavorite(articleId: MaybeRef<number>) {
  const currentUser = useCurrentUser()
  const { isLoggedIn, userInfo } = storeToRefs(currentUser)
  const toast = useToast()

  const _articleId = computed(() => unref(articleId))

  /** 文章所属的收藏夹 ID 列表（从收藏记录中提取） */
  const {
    data: favoriteFolderIds,
    pending: favoriteFoldersPending,
    execute: executeFavoriteFolders,
    refresh: refreshFavoriteFolders
  } = useAsyncData<number[]>(
    () => `article-favorite-folders-${_articleId.value}`,
    async () => {
      if (!import.meta.client) return []
      if (!isLoggedIn.value || !Number.isFinite(_articleId.value)) return []

      try {
        const records = await getArticleFavorites(_articleId.value)
        // 从收藏记录中提取收藏夹 ID
        return records.map((record) => record.favoritesId)
      } catch (error) {
        console.error('获取收藏状态失败', error)
        return []
      }
    },
    {
      server: false,
      default: () => [],
      immediate: false
    }
  )

  /** 用户的所有收藏夹 */
  const {
    data: userFolders,
    pending: userFoldersPending,
    execute: executeUserFolders,
    refresh: refreshUserFolders
  } = useAsyncData<Favorite.FavoriteFolderList>(
    () => `user-favorite-folders-${userInfo.value?.id ?? 'guest'}`,
    async () => {
      if (!import.meta.client) return []
      if (!isLoggedIn.value || !userInfo.value?.id) return []

      try {
        return await getUserFavorites(userInfo.value.id)
      } catch (error) {
        console.error('获取收藏夹列表失败', error)
        return []
      }
    },
    {
      server: false,
      default: () => [],
      immediate: false
    }
  )

  /** 默认收藏夹 */
  const {
    data: defaultFolder,
    pending: defaultFolderPending,
    execute: executeDefaultFolder
  } = useAsyncData<Favorite.FavoriteFolder | null>(
    () => `default-favorite-folder-${userInfo.value?.id ?? 'guest'}`,
    async () => {
      if (!import.meta.client) return null
      if (!isLoggedIn.value) return null

      try {
        return await getDefaultFavorite()
      } catch (error) {
        console.error('获取默认收藏夹失败', error)
        return null
      }
    },
    {
      server: false,
      default: () => null,
      immediate: false
    }
  )

  /** 是否已收藏（至少在一个收藏夹中） */
  const isFavorited = computed(() => (favoriteFolderIds.value?.length ?? 0) > 0)

  /** 收藏夹数量 */
  const favoriteFoldersCount = computed(() => favoriteFolderIds.value?.length ?? 0)

  /** 加载状态 */
  const loading = computed(
    () => favoriteFoldersPending.value || userFoldersPending.value || defaultFolderPending.value
  )

  /** 操作中的 mutation 状态 */
  const mutationLoading = ref(false)

  /**
   * 检查文章是否在指定收藏夹中
   * @param folderId 收藏夹 ID
   */
  function isInFolder(folderId: number): boolean {
    return favoriteFolderIds.value?.includes(folderId) ?? false
  }

  /**
   * 添加文章到收藏夹
   * @param folderId 收藏夹 ID
   */
  async function addToFavorite(folderId: number): Promise<void> {
    if (!isLoggedIn.value) {
      throw new Error('User not logged in')
    }

    if (mutationLoading.value) return

    mutationLoading.value = true
    try {
      await favoriteArticle({
        articleId: _articleId.value,
        favoritesId: folderId
      })

      // 直接更新本地状态
      const records = await getArticleFavorites(_articleId.value)
      favoriteFolderIds.value = records.map((record) => record.favoritesId)
    } finally {
      mutationLoading.value = false
    }
  }

  /**
   * 从收藏夹移除文章
   * @param folderId 收藏夹 ID
   */
  async function removeFromFavorite(folderId: number): Promise<void> {
    if (!isLoggedIn.value) {
      throw new Error('User not logged in')
    }

    if (mutationLoading.value) return

    mutationLoading.value = true
    try {
      await unfavoriteArticle({
        articleId: _articleId.value,
        favoritesId: folderId
      })

      // 直接更新本地状态
      const records = await getArticleFavorites(_articleId.value)
      favoriteFolderIds.value = records.map((record) => record.favoritesId)
    } finally {
      mutationLoading.value = false
    }
  }

  /**
   * 切换收藏夹中的文章（已收藏则取消，未收藏则添加）
   * @param folderId 收藏夹 ID
   */
  async function toggleFavorite(folderId: number): Promise<void> {
    if (isInFolder(folderId)) {
      await removeFromFavorite(folderId)
      toast.add({
        title: '已取消收藏',
        color: 'neutral'
      })
    } else {
      await addToFavorite(folderId)
      toast.add({
        title: '收藏成功',
        color: 'success'
      })
    }
  }

  /**
   * 快速收藏到默认收藏夹
   */
  async function quickFavorite(): Promise<void> {
    if (!isLoggedIn.value) {
      throw new Error('User not logged in')
    }

    // 确保已加载默认收藏夹
    if (!defaultFolder.value) {
      await executeDefaultFolder()
    }

    if (!defaultFolder.value) {
      throw new Error('No default folder found')
    }

    await toggleFavorite(defaultFolder.value.id)
  }

  /** 初始化：加载收藏状态和收藏夹列表 */
  async function initialize(): Promise<void> {
    if (!import.meta.client) return
    if (!isLoggedIn.value || !Number.isFinite(_articleId.value)) {
      favoriteFolderIds.value = []
      userFolders.value = []
      defaultFolder.value = null
      return
    }

    await Promise.all([
      executeFavoriteFolders().catch(() => {}),
      executeUserFolders().catch(() => {}),
      executeDefaultFolder().catch(() => {})
    ])
  }

  // 客户端监听登录状态和文章 ID 变化
  if (import.meta.client) {
    watch(
      () => [isLoggedIn.value, _articleId.value],
      async ([loggedIn, id]) => {
        if (!loggedIn || !Number.isFinite(id)) {
          favoriteFolderIds.value = []
          userFolders.value = []
          defaultFolder.value = null
          return
        }

        await initialize()
      },
      { immediate: true }
    )
  }

  return {
    // 状态
    userFolders: computed(() => userFolders.value ?? []),
    defaultFolder: computed(() => defaultFolder.value),
    isFavorited,
    favoriteFoldersCount,
    loading,
    mutationLoading: computed(() => mutationLoading.value),

    // 方法
    isInFolder,
    addToFavorite,
    removeFromFavorite,
    toggleFavorite,
    quickFavorite,
    refreshFavoriteFolders,
    refreshUserFolders,
    initialize
  }
}
