<script lang="ts" setup>
/** Vue Route */
const route = useRoute()

/** 文章 ID */
const articleId = route.params.articleId as string

/** 获取文章详情 */
const {
  data: article,
  success,
  code,
  message,
  pending,
  refresh
} = useApi<Article.ArticleDetail>(() => `/article/${articleId}`)

/** 格式化发布时间 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/** 返回文章列表 */
const goBack = () => {
  navigateTo('/')
}

/** 重新加载数据 */
const retry = () => {
  refresh()
}

/** 页面 meta 设置 */
useHead(() => ({
  title: article.value?.title ? `${article.value.title} - Wolf Blog` : 'Wolf Blog',
  meta: [{ name: 'description', content: article.value?.primary || '文章详情页' }]
}))
</script>

<template>
  <div class="container mx-auto py-8">
    <!-- 返回按钮 -->
    <div class="mb-6">
      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" @click="goBack">
        返回文章列表
      </UButton>
    </div>

    <!-- 加载状态 -->
    <div v-if="pending" class="space-y-6">
      <!-- 标题骨架屏 -->
      <USkeleton class="h-12 w-full" />

      <!-- 文章信息骨架屏 -->
      <div class="flex flex-wrap gap-4">
        <USkeleton class="h-6 w-32" />
        <USkeleton class="h-6 w-24" />
        <USkeleton class="h-6 w-20" />
      </div>

      <!-- 摘要骨架屏 -->
      <USkeleton class="h-20 w-full" />

      <!-- 内容骨架屏 -->
      <div class="space-y-3">
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-4/5" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-3/4" />
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="!success" class="py-12 text-center">
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

          <UButton variant="outline" color="neutral" @click="retry"> 重试 </UButton>
        </div>
      </UCard>
    </div>

    <!-- 文章内容 -->
    <div v-else-if="article" class="space-y-8">
      <!-- 文章头部 -->
      <UCard>
        <template #header>
          <div class="space-y-4">
            <!-- 文章标题 -->
            <h1 class="text-3xl leading-tight font-bold text-gray-900 dark:text-white">
              {{ article.title }}
            </h1>

            <!-- 文章元信息 -->
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <!-- 发布时间 -->
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-calendar" class="h-4 w-4" />
                <span>{{ formatDate(article.postTime) }}</span>
              </div>

              <!-- 作者 -->
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-user" class="h-4 w-4" />
                <span>作者 ID: {{ article.authorId }}</span>
              </div>

              <!-- 分区 -->
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-folder" class="h-4 w-4" />
                <span>分区 ID: {{ article.partitionId }}</span>
              </div>
            </div>

            <!-- 标签 -->
            <div v-if="article.tags.length > 0" class="flex flex-wrap gap-2">
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

            <!-- 常用标签 -->
            <div v-if="article.comUseTags.length > 0" class="flex flex-wrap gap-2">
              <UChip v-for="tagId in article.comUseTags" :key="tagId" size="sm" color="neutral">
                <UBadge variant="outline" color="secondary" size="xs"> #{{ tagId }} </UBadge>
              </UChip>
            </div>
          </div>
        </template>

        <!-- 文章摘要 -->
        <div v-if="article.primary" class="prose-gray dark:prose-invert max-w-none">
          <div class="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p class="leading-relaxed text-gray-700 dark:text-gray-300">
              {{ article.primary }}
            </p>
          </div>
        </div>

        <!-- 文章正文 -->
        <div class="prose prose-gray dark:prose-invert max-w-none">
          <!-- 这里可以根据实际情况使用 markdown 渲染器或其他富文本渲染 -->
          <div class="leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {{ article.content }}
          </div>
        </div>
      </UCard>

      <!-- 文章操作 -->
      <UCard>
        <div class="flex items-center justify-between">
          <div class="flex gap-4">
            <UButton icon="i-lucide-heart" variant="outline" color="neutral"> 点赞 </UButton>

            <UButton icon="i-lucide-bookmark" variant="outline" color="neutral"> 收藏 </UButton>

            <UButton icon="i-lucide-share-2" variant="outline" color="neutral"> 分享 </UButton>
          </div>

          <UButton icon="i-lucide-message-circle" variant="soft" color="primary"> 评论 </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
.prose {
  font-size: 16px;
  line-height: 1.75;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.prose p {
  margin-bottom: 1.25rem;
}

.prose ul,
.prose ol {
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.5rem;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.dark .prose code {
  background-color: #374151;
}

.prose pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.prose blockquote {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #6b7280;
}

.dark .prose blockquote {
  border-left-color: #4b5563;
  color: #9ca3af;
}
</style>
