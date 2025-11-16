<script lang="ts" setup>
import { deleteArticle, getArticleDetail } from '~/apis/article'
import { ApiError } from '~~/shared/types/ApiError'
import { MdCatalog, MdPreview } from 'md-editor-v3'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { getArticleSelfLikeStatus, likeArticle, unlikeArticle } from '@/apis/article/like'

const route = useRoute()
const toast = useToast()

/** 当前登录用户 */
const currentUser = useCurrentUser()
const { isLoggedIn, userInfo } = storeToRefs(currentUser)

/** 分区解析器 */
const partitionResolver = usePartitionResolver()

const articleId = computed(() => Number(route.params.articleId))
const loginRedirectPath = computed(() => {
  const redirect = encodeURIComponent(route.fullPath)
  return `/user/login?redirect=${redirect}`
})

const commentSectionRef = ref<{ scrollToComments: () => void } | null>(null)
const commentCount = ref(0)

const routeCacheHit = ref(false)

/** 工具栏滚动控制 */
const lastScrollY = ref(0)
const isToolbarVisible = ref(true)
const scrollThreshold = 50 // 滚动阈值，滚动超过此距离才触发隐藏/显示

const { y: windowScrollY } = useWindowScroll()

/** 是否显示工具栏阴影 */
const shouldShowShadow = computed(() => {
  if (!import.meta.client) return false
  return windowScrollY.value > 0
})

/**
 * 尝试复用通过 Vue Router 导航状态携带的文章详情。
 * 如果缓存的数据属于当前路由，会立刻从 history state 中移除，避免后续页面再次复用。
 * @param {number} targetArticleId 当前路由解析出的文章 ID。
 * @returns {Article.ArticleDetail | null} 命中缓存时返回文章详情，否则返回 null。
 */
function consumeArticleDetailFromHistory(targetArticleId: number): Article.ArticleDetail | null {
  if (!import.meta.client) return null
  const rawState = window.history.state
  if (!rawState || typeof rawState !== 'object') return null
  const state = rawState as Record<string, unknown>
  const currentPath = typeof state.current === 'string' ? state.current : null
  if (currentPath && currentPath !== route.fullPath) return null
  const rawArticle = state.articleDetail
  if (rawArticle && typeof rawArticle === 'object') {
    const articleDetail = rawArticle as Article.ArticleDetail
    if (Number(articleDetail.id) === targetArticleId) {
      const { articleDetail: _omit, ...rest } = state
      window.history.replaceState(rest, '', window.location.href)
      return articleDetail
    }
  }
  return null
}

/**
 * 清理浏览器 history state 中残留的文章详情数据。
 * 在触发网络刷新前调用，确保不会再次使用已过期的旧数据。
 */
function clearArticleDetailFromHistory() {
  if (!import.meta.client) return
  const rawState = window.history.state
  if (!rawState || typeof rawState !== 'object') return
  if (!('articleDetail' in rawState)) return
  const state = rawState as Record<string, unknown>
  const { articleDetail: _omit, ...rest } = state
  window.history.replaceState(rest, '', window.location.href)
}

const {
  data: article,
  pending,
  status,
  error,
  refresh: refreshArticleDetail
} = await useAsyncData<Article.ArticleDetail | null, ApiError>(
  () => `article-detail-${articleId.value}`,
  /**
   * 获取文章详情数据：在客户端优先使用路由状态中的缓存，否则回退到接口请求。
   * @throws {Error} 当路由解析出的文章 ID 非法时抛出错误。
   */
  async (): Promise<Article.ArticleDetail> => {
    const id = articleId.value
    routeCacheHit.value = false
    if (!Number.isFinite(id)) {
      throw new Error('Invalid article id')
    }

    if (import.meta.client) {
      const cached = consumeArticleDetailFromHistory(id)
      if (cached) {
        routeCacheHit.value = true
        return cached
      }
    }

    return await getArticleDetail(id)
  },
  {
    watch: [articleId],
    default: () => null
  }
)

const success = computed(() => status.value === 'success' && article.value != null)

const code = computed(() => {
  const err = error.value
  if (!err) return undefined
  if (err instanceof ApiError) return err.code
  const maybeStatus = (err as { statusCode?: number }).statusCode
  if (typeof maybeStatus === 'number') return `HTTP_${maybeStatus}`
  return 'UNKNOWN'
})

const message = computed(() => {
  const err = error.value
  if (err) return err.message || '未知错误'
  if (routeCacheHit.value) return '已复用上一页的文章数据，未再次请求'
  return '未知错误'
})

/**
 * 强制重新获取文章详情，并在请求前清空路由缓存状态，确保刷新数据为最新。
 */
const refresh = async () => {
  routeCacheHit.value = false
  if (import.meta.client) {
    clearArticleDetailFromHistory()
  }
  return refreshArticleDetail()
}

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function redirectToLogin() {
  navigateTo(loginRedirectPath.value)
}

function handleCommentCountUpdate(count: number) {
  commentCount.value = count
}

/** 处理滚动事件 */
function handleScroll() {
  if (!import.meta.client) return

  const currentScrollY = window.scrollY
  const scrollDifference = currentScrollY - lastScrollY.value

  // 如果滚动距离超过阈值，则更新工具栏显示状态
  if (Math.abs(scrollDifference) > scrollThreshold) {
    // 向下滚动时隐藏工具栏，向上滚动时显示工具栏
    isToolbarVisible.value = scrollDifference < 0
    lastScrollY.value = currentScrollY
  }
}

/** 下拉菜单项 */
const dropdownItems = computed(() => {
  const items = []

  // 作者可见的操作
  if (isLoggedIn.value && userInfo.value?.id === article.value?.author.id) {
    items.push(
      {
        label: '编辑',
        icon: 'i-lucide-edit',
        onSelect: () => navigateTo(`/articles/edit/${articleId.value}`)
      },
      {
        label: '删除',
        icon: 'i-lucide-trash-2',
        onSelect: handleDeleteArticle
      }
    )
  }

  // 通用操作
  items.push(
    {
      label: isLiked.value ? '已点赞' : '点赞',
      icon: 'lucide:thumbs-up',
      onSelect: handleToggleLike
    },
    {
      label: isFavorited.value ? `已收藏 (${favoriteFoldersCount.value})` : '收藏',
      icon: 'i-lucide-bookmark',
      onSelect: handleFavoriteClick
    },
    {
      label: '分享',
      icon: 'i-lucide-share-2',
      onSelect: handleShareArticle
    }
  )

  return items
})

const likeMutationLoading = ref(false)

const {
  data: likeStatus,
  pending: likeStatusPending,
  execute: executeLikeStatus,
  refresh: refreshLikeStatus
} = await useAsyncData<boolean>(
  () => `article-like-status-${articleId.value}`,
  async () => {
    if (!import.meta.client) {
      return false
    }
    if (!isLoggedIn.value || !Number.isFinite(articleId.value)) {
      return false
    }

    try {
      return await getArticleSelfLikeStatus(articleId.value)
    } catch (error) {
      console.error('获取点赞状态失败', error)
      toast.add({
        title: '点赞状态获取失败',
        description: '稍后自动重试，请稍候再试',
        color: 'warning'
      })
      return false
    }
  },
  {
    server: false,
    default: () => false,
    immediate: false
  }
)

const isLiked = computed(() => likeStatus.value ?? false)

const likeStatusLoading = computed(() => likeStatusPending.value)

if (import.meta.client) {
  watch(
    () => [isLoggedIn.value, articleId.value],
    async ([loggedIn, id]) => {
      if (!loggedIn || !Number.isFinite(id)) {
        likeStatus.value = false
        return
      }

      await executeLikeStatus().catch(() => {})
    },
    { immediate: true }
  )
}

/** 收藏相关 */
const isFavoriteModalOpen = ref(false)

const {
  isFavorited,
  favoriteFoldersCount,
  loading: favoriteLoading,
  mutationLoading: favoriteMutationLoading
} = useArticleFavorite(articleId)

/** 删除确认模态框 */
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)

/** 点赞 */
async function handleToggleLike() {
  if (!isLoggedIn.value) {
    toast.add({
      title: '请先登录',
      description: '登录后才能点赞文章',
      color: 'neutral'
    })
    redirectToLogin()
    return
  }

  if (likeMutationLoading.value) return

  likeMutationLoading.value = true
  try {
    if (isLiked.value) {
      await unlikeArticle(articleId.value)
      likeStatus.value = false
      toast.add({
        title: '已取消点赞',
        color: 'neutral'
      })
    } else {
      await likeArticle(articleId.value)
      likeStatus.value = true
      toast.add({
        title: '点赞成功',
        color: 'success'
      })
    }

    await refreshLikeStatus().catch(() => {})
  } catch (error) {
    console.error('更新点赞状态失败', error)
    toast.add({
      title: '操作失败',
      description: '请稍后再试',
      color: 'error'
    })
  } finally {
    likeMutationLoading.value = false
  }
}

/** 收藏按钮点击 */
function handleFavoriteClick() {
  if (!isLoggedIn.value) {
    toast.add({
      title: '请先登录',
      description: '登录后才能收藏文章',
      color: 'neutral'
    })
    redirectToLogin()
    return
  }

  isFavoriteModalOpen.value = true
}

function goBack() {
  navigateTo('/')
}

function retry() {
  refresh()
}

/** 删除文章 */
async function handleDeleteArticle() {
  if (!article.value) return
  isDeleteModalOpen.value = true
}

/** 确认删除文章 */
async function confirmDeleteArticle() {
  if (!article.value) return

  isDeleting.value = true
  try {
    await deleteArticle(article.value.id)
    toast.add({
      title: '删除成功',
      description: '文章已删除',
      color: 'success'
    })
    isDeleteModalOpen.value = false
    // 删除成功后返回文章列表
    navigateTo('/')
  } catch (error) {
    console.error('删除文章失败', error)
    toast.add({
      title: '删除失败',
      description: '请稍后再试',
      color: 'error'
    })
  } finally {
    isDeleting.value = false
  }
}

/** 分享文章 */
async function handleShareArticle() {
  if (!import.meta.client) return

  try {
    // 获取当前页面URL
    const currentUrl = window.location.href

    // 构造分享URL，添加分享来源参数
    const url = new URL(currentUrl)
    if (userInfo.value?.id) {
      url.searchParams.set('shared_from_user', userInfo.value.id.toString())
    }

    // 复制到剪贴板
    await navigator.clipboard.writeText(url.toString())

    // 显示成功提示
    toast.add({
      title: '分享链接已复制',
      description: '链接已复制到剪贴板，可以分享给其他人',
      color: 'success'
    })
  } catch (error) {
    console.error('分享失败', error)
    toast.add({
      title: '分享失败',
      description: '无法访问剪贴板，请手动复制链接',
      color: 'error'
    })
  }
}

useSeo(
  computed(() => {
    const {
      public: { siteUrl }
    } = useRuntimeConfig()

    if (!article.value) {
      return {
        title: '文章详情',
        description: '查看文章详情和内容',
        type: 'article'
      }
    }

    return {
      title: article.value.title,
      description: article.value.primary || article.value.title,
      keywords: article.value.tags?.join(',') || '文章,博客,技术分享',
      type: 'article',
      author: article.value.author.nickname || article.value.author.account,
      publishedTime: article.value.postTime,
      modifiedTime: article.value.postTime,
      section: `分区 ${article.value.partitionId}`,
      tags: article.value.tags || [],
      canonical: `${siteUrl}/articles/${article.value.id}`
    }
  })
)

/** 滚动事件监听 */
onMounted(() => {
  if (import.meta.client) {
    lastScrollY.value = window.scrollY
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('scroll', handleScroll)
  }
})

// 当文章加载成功后，获取分区信息
watch(
  () => article.value,
  (articleData) => {
    if (articleData?.partitionId) {
      void partitionResolver.fetchPartitions()
    }
  },
  { immediate: true }
)
</script>

<template>
  <div>
    <!-- Toolbar -->
    <div
      class="fixed inset-x-0 z-40 transition-opacity duration-300 ease-in-out"
      :class="{ 'pointer-events-none opacity-0': !isToolbarVisible }"
      :style="{ top: 'calc(var(--ui-header-height) + 1rem)' }"
    >
      <UContainer>
        <div
          class="flex items-center justify-between rounded-lg border border-gray-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80"
          :class="{ 'shadow-lg': shouldShowShadow }"
        >
          <!-- 左侧：返回按钮 -->
          <div class="flex items-center">
            <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" @click="goBack">
              <span class="hidden sm:inline">返回文章列表</span>
              <span class="sm:hidden">返回</span>
            </UButton>
          </div>

          <!-- 右侧：操作按钮 -->
          <div class="flex items-center gap-2">
            <!-- 桌面端显示 -->
            <div class="hidden items-center gap-2 md:flex">
              <!-- 作者可见的操作 -->
              <template v-if="isLoggedIn && userInfo?.id === article?.author.id">
                <UButton
                  icon="i-lucide-edit"
                  color="neutral"
                  variant="soft"
                  @click="() => void navigateTo(`/articles/edit/${articleId}`)"
                >
                  编辑
                </UButton>
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="soft"
                  @click="handleDeleteArticle"
                >
                  删除
                </UButton>
                <USeparator orientation="vertical" class="h-6" />
              </template>

              <!-- 通用操作 -->
              <UButton
                icon="lucide:thumbs-up"
                :color="isLiked ? 'primary' : 'neutral'"
                :variant="isLiked ? 'solid' : 'outline'"
                :loading="likeStatusLoading || likeMutationLoading"
                @click="handleToggleLike"
              >
                {{ isLiked ? '已点赞' : '点赞' }}
              </UButton>
              <UButton
                icon="i-lucide-bookmark"
                :color="isFavorited ? 'primary' : 'neutral'"
                :variant="isFavorited ? 'solid' : 'outline'"
                :loading="favoriteLoading || favoriteMutationLoading"
                @click="handleFavoriteClick"
              >
                {{ isFavorited ? `已收藏 (${favoriteFoldersCount})` : '收藏' }}
              </UButton>
              <UButton
                icon="i-lucide-share-2"
                variant="outline"
                color="neutral"
                @click="handleShareArticle"
              >
                分享
              </UButton>
            </div>

            <!-- 移动端下拉菜单 -->
            <div class="md:hidden">
              <UDropdownMenu :items="dropdownItems" mode="click">
                <UButton icon="i-lucide-more-vertical" variant="ghost" color="neutral" />
              </UDropdownMenu>
            </div>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Article Content -->
    <div class="pt-24 pb-6">
      <div v-if="pending" class="space-y-6">
        <USkeleton class="h-12 w-full" />
        <div class="flex flex-wrap gap-4">
          <USkeleton class="h-6 w-32" />
          <USkeleton class="h-6 w-24" />
          <USkeleton class="h-6 w-20" />
        </div>
        <USkeleton class="h-20 w-full" />
        <div class="space-y-3">
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-4/5" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-3/4" />
        </div>
      </div>

      <div v-else-if="status !== 'pending' && !success" class="py-12 text-center">
        <UCard>
          <template #header>
            <div class="flex items-center gap-3 text-red-500">
              <UIcon name="i-lucide-alert-circle" class="h-6 w-6" />
              <h3 class="text-lg font-semibold">加载失败</h3>
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-gray-600">{{ message }}</p>
            <p class="text-sm text-gray-400">错误代码: {{ code }}</p>
            <UButton variant="outline" color="neutral" @click="retry">重试</UButton>
          </div>
        </UCard>
      </div>

      <div v-else-if="article" class="space-y-8">
        <UCard>
          <template #header>
            <div class="space-y-4">
              <h1 class="text-3xl leading-tight font-bold text-gray-900 dark:text-white">
                {{ article.title }}
              </h1>
              <div
                class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400"
              >
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-calendar" class="h-4 w-4" />
                  <span>发布于 {{ formatDateTime(article.postTime, 'YYYY-MM-DD HH:mm') }}</span>
                </div>
                <div
                  v-if="article.editTime && article.editTime !== article.postTime"
                  class="flex items-center gap-2"
                >
                  <UIcon name="i-lucide-clock" class="h-4 w-4" />
                  <span>更新于 {{ formatDateTime(article.editTime, 'YYYY-MM-DD HH:mm') }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-eye" class="h-4 w-4" />
                  <span>{{ article.views }} 浏览</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-user" class="h-4 w-4" />
                  <ULink :to="`/user/${article.author.id}`"
                    >作者: {{ article.author.nickname ?? article.author.account }}</ULink
                  >
                </div>
                <div v-if="article.partitionId" class="flex items-center gap-2">
                  <UIcon name="i-lucide-folder" class="h-4 w-4" />
                  <span>{{ partitionResolver.resolvePartitionName(article.partitionId) }}</span>
                </div>
              </div>
              <div v-if="article.tags?.length" class="flex flex-wrap gap-2">
                <UBadge
                  v-for="tag in article.tags"
                  :key="tag"
                  variant="soft"
                  color="primary"
                  size="sm"
                >
                  {{ tag }}
                </UBadge>
              </div>
              <div v-if="article.comUseTags?.length" class="flex flex-wrap gap-2">
                <UChip v-for="tagId in article.comUseTags" :key="tagId" size="sm" color="neutral">
                  <UBadge variant="outline" color="secondary" size="xs">#{{ tagId }}</UBadge>
                </UChip>
              </div>
            </div>
          </template>

          <div v-if="article.primary" class="dark:prose-invert max-w-none">
            <div class="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <p class="leading-relaxed text-gray-700 dark:text-gray-300">
                {{ article.primary }}
              </p>
            </div>
          </div>

          <div class="w-full">
            <MdCatalog id="article-content" />
            <MdPreview
              editor-id="article-content"
              :theme="isDark ? 'dark' : 'light'"
              :model-value="article.content"
            />
          </div>
        </UCard>

        <ArticleComments
          ref="commentSectionRef"
          :article-id="article.id"
          :article-author-id="article.author.id"
          :login-redirect-path="loginRedirectPath"
          @update:count="handleCommentCountUpdate"
        />
      </div>
    </div>

    <!-- 收藏夹选择弹窗 -->
    <ArticleFavoriteFolderModal v-model:open="isFavoriteModalOpen" :article-id="articleId" />

    <!-- 删除确认弹窗 -->
    <DeleteConfirmModal
      v-model:open="isDeleteModalOpen"
      :item-name="article?.title || '此文章'"
      title="删除文章"
      message="确定要删除这篇文章吗？此操作不可撤销，文章内容将永久丢失。"
      :loading="isDeleting"
      @confirm="confirmDeleteArticle"
    />
  </div>
</template>

<style scoped></style>
