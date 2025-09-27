<script lang="ts" setup>
import { MdCatalog, MdPreview } from 'md-editor-v3'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { getArticleSelfLikeStatus, likeArticle, unlikeArticle } from '@/apis/article/like'

const route = useRoute()
const toast = useToast()
const colorMode = useColorMode()

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

const {
  data: article,
  status,
  pending,
  success,
  code,
  message,
  refresh
} = useApi<Article.ArticleDetail>(() => `/article/${articleId.value}`, {
  watch: [articleId]
})

const isDark = computed(() => colorMode.value === 'dark')

const isLiked = ref(false)
const likeStatusLoading = ref(false)
const likeMutationLoading = ref(false)

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

async function fetchLikeStatus() {
  if (!import.meta.client) return
  if (!isLoggedIn.value) {
    isLiked.value = false
    return
  }

  likeStatusLoading.value = true
  try {
    isLiked.value = await getArticleSelfLikeStatus(articleId.value)
  } catch (error) {
    console.error('获取点赞状态失败', error)
    toast.add({
      title: '点赞状态获取失败',
      description: '稍后自动重试，请稍候再试',
      color: 'warning'
    })
  } finally {
    likeStatusLoading.value = false
  }
}

if (import.meta.client) {
  watch(
    () => [isLoggedIn.value, articleId.value],
    ([loggedIn]) => {
      if (loggedIn) {
        void fetchLikeStatus()
      } else {
        isLiked.value = false
      }
    },
    { immediate: true }
  )
}

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
      isLiked.value = false
      toast.add({
        title: '已取消点赞',
        color: 'neutral'
      })
    } else {
      await likeArticle(articleId.value)
      isLiked.value = true
      toast.add({
        title: '点赞成功',
        color: 'success'
      })
    }

    await refresh()
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

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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
  <div class="container mx-auto py-8">
    <div class="mb-6 flex flex-row items-center justify-between">
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
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-calendar" class="h-4 w-4" />
                <span>{{ formatDate(article.postTime) }}</span>
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

      <UCard>
        <div class="flex items-center justify-between">
          <div class="flex gap-4">
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
          </div>
          <UButton
            icon="i-lucide-message-circle"
            variant="soft"
            color="primary"
            @click="scrollToComments"
          >
            {{ commentCount > 0 ? `评论 (${commentCount})` : '评论' }}
          </UButton>
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
</template>

<style scoped></style>
