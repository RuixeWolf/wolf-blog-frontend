<script lang="ts" setup>
import { getArticleDetail } from '~/apis/article'
import { ApiError } from '~~/shared/types/ApiError'
import { MdCatalog, MdPreview } from 'md-editor-v3'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getArticleSelfLikeStatus, likeArticle, unlikeArticle } from '@/apis/article/like'

const route = useRoute()
const toast = useToast()

/** 当前登录用户 */
const currentUser = useCurrentUser()
const { isLoggedIn, userInfo } = storeToRefs(currentUser)

const articleId = computed(() => Number(route.params.articleId))
const loginRedirectPath = computed(() => {
  const redirect = encodeURIComponent(route.fullPath)
  return `/user/login?redirect=${redirect}`
})

const commentSectionRef = ref<{ scrollToComments: () => void } | null>(null)
const commentCount = ref(0)

const routeCacheHit = ref(false)

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

const isDark = useDark()

function redirectToLogin() {
  navigateTo(loginRedirectPath.value)
}

function handleCommentCountUpdate(count: number) {
  commentCount.value = count
}

function scrollToComments() {
  if (!import.meta.client) return
  commentSectionRef.value?.scrollToComments()
}

const toolbarVisible = ref(true)
const lastScrollY = ref(0)
const scrollThreshold = 12

function handleToolbarVisibility() {
  if (!import.meta.client) return
  const current = window.scrollY || 0
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)

  if (current <= 0) {
    toolbarVisible.value = true
  } else if (current > lastScrollY.value + scrollThreshold) {
    toolbarVisible.value = false
  } else if (current < lastScrollY.value - scrollThreshold) {
    toolbarVisible.value = true
  } else if (current >= maxScroll - scrollThreshold) {
    toolbarVisible.value = true
  }

  lastScrollY.value = current
}

onMounted(() => {
  if (!import.meta.client) return
  lastScrollY.value = window.scrollY || 0
  window.addEventListener('scroll', handleToolbarVisibility, { passive: true })
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('scroll', handleToolbarVisibility)
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

function goBack() {
  navigateTo('/')
}

function retry() {
  refresh()
}

useHead(() => ({
  title: article.value?.title ? `${article.value.title} - Wolf Blog` : 'Wolf Blog',
  meta: [{ name: 'description', content: article.value?.primary || '文章详情页' }]
}))
</script>

<template>
  <div>
    <div class="fixed inset-x-0 bottom-6 z-50 px-4">
      <div
        class="mx-auto flex max-w-5xl transform flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white/80 px-4 py-3 backdrop-blur transition-all duration-300 ease-out dark:border-gray-800 dark:bg-gray-900/80"
        :class="{
          'pointer-events-none translate-y-full opacity-0': !toolbarVisible,
          'translate-y-0 shadow-lg': toolbarVisible
        }"
      >
        <div class="flex items-center gap-2">
          <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" @click="goBack">
            返回文章列表
          </UButton>
          <UButton
            v-if="isLoggedIn && userInfo?.id === article?.authorId"
            icon="i-lucide-edit"
            variant="ghost"
            color="neutral"
            @click="() => void navigateTo(`/articles/edit/${articleId}`)"
          >
            编辑文章
          </UButton>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            :icon="isLiked ? 'i-lucide-heart' : 'i-lucide-heart-off'"
            :color="isLiked ? 'primary' : 'neutral'"
            :variant="isLiked ? 'solid' : 'outline'"
            :loading="likeStatusLoading || likeMutationLoading"
            @click="handleToggleLike"
          >
            {{ isLiked ? '已点赞' : '点赞' }}
          </UButton>
          <UButton icon="i-lucide-bookmark" variant="outline" color="neutral">收藏</UButton>
          <UButton icon="i-lucide-share-2" variant="outline" color="neutral">分享</UButton>
          <UButton
            icon="i-lucide-message-circle"
            variant="soft"
            color="primary"
            @click="scrollToComments"
          >
            {{ commentCount > 0 ? `评论 (${commentCount})` : '评论' }}
          </UButton>
        </div>
      </div>
    </div>

    <div class="container mx-auto pt-6 pb-32">
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
                  <span>{{ formatDateTime(article.postTime) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-user" class="h-4 w-4" />
                  <span>作者 ID: {{ article.authorId }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-folder" class="h-4 w-4" />
                  <span>分区 ID: {{ article.partitionId }}</span>
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
          :article-author-id="article.authorId"
          :login-redirect-path="loginRedirectPath"
          @update:count="handleCommentCountUpdate"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
