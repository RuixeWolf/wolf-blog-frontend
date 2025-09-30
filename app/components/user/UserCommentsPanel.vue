<script setup lang="ts">
import { formatDateTime } from '~~/shared/utils/date'
import { toRefs } from 'vue'

interface SimpleArticleEntry {
  id: number
  title: string
  postTime?: string | null
  views?: number | null
}

interface CommentEntry {
  article: SimpleArticleEntry
  comment: Article.Comment
}

const props = defineProps<{
  /** 评论列表数据 */
  comments: CommentEntry[]
  /** 评论拉取中的状态 */
  commentsPending: boolean
  /** 作者文章列表是否仍在加载 */
  ownerArticlesPending: boolean
  /** 作者文章接口错误信息 */
  ownerArticlesErrorMessage?: string | null
  /** 评论接口错误信息 */
  commentsError: Error | null
  /** 已加载文章数量 */
  normalizedArticleCount: number
}>()

const {
  comments,
  commentsPending,
  ownerArticlesPending,
  ownerArticlesErrorMessage,
  commentsError,
  normalizedArticleCount
} = toRefs(props)

const emit = defineEmits<{
  /** 请求重新加载评论 */
  (event: 'refresh'): void
}>()

/**
 * 触发评论刷新事件。
 */
function handleRefresh() {
  emit('refresh')
}
</script>

<template>
  <section id="user-comments" class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg font-semibold">评论管理</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          已加载 {{ normalizedArticleCount }} 篇文章的最新评论
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-refresh-cw"
          variant="ghost"
          color="neutral"
          :loading="commentsPending"
          @click="handleRefresh"
        >
          刷新评论
        </UButton>
      </div>
    </div>

    <div v-if="ownerArticlesPending" class="space-y-3">
      <USkeleton v-for="index in 3" :key="index" class="h-20 w-full" />
    </div>

    <UAlert
      v-else-if="ownerArticlesErrorMessage"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-circle"
    >
      {{ ownerArticlesErrorMessage }}
    </UAlert>

    <UAlert v-else-if="commentsError" color="error" variant="subtle" icon="i-lucide-alert-circle">
      {{ commentsError.message }}
    </UAlert>

    <UAlert v-else-if="!comments.length" color="neutral" variant="subtle" icon="i-lucide-info">
      暂无新的评论动态。
    </UAlert>

    <div v-else class="space-y-4">
      <UCard
        v-for="entry in comments"
        :key="entry.comment.id"
        class="border border-gray-100 dark:border-gray-800"
      >
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="primary" variant="subtle">文章 #{{ entry.article.id }}</UBadge>
              <NuxtLink
                :to="`/articles/${entry.article.id}`"
                class="text-primary text-sm font-medium underline-offset-4 hover:underline"
              >
                {{ entry.article.title }}
              </NuxtLink>
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatDateTime(entry.comment.commentTime, 'YYYY-MM-DD HH:mm') }}
            </span>
          </div>
        </template>

        <p class="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-200">
          {{ entry.comment.content }}
        </p>

        <template #footer>
          <div
            class="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400"
          >
            <span>评论 ID：{{ entry.comment.id }}</span>
            <span>评论用户 ID：{{ entry.comment.userId }}</span>
          </div>
        </template>
      </UCard>
    </div>
  </section>
</template>
