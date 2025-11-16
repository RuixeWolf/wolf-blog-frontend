<script setup lang="ts">
import { deleteArticle, queryArticles } from '@/apis/article'

const props = defineProps<{
  userId: number
  pageSize?: number
  title?: string
}>()

const toast = useToast()
const currentUser = useCurrentUser()

/**
 * 判断当前用户是否为文章所有者。
 */
const isOwnArticles = computed(() => currentUser.userInfo?.id === props.userId)

const pageNumber = ref(1)

/**
 * 计算当前分页大小，默认 10 条。
 */
const pageSize = computed(() => props.pageSize ?? 10)

const key = computed(() => `user-${props.userId}-articles-${pageNumber.value}-${pageSize.value}`)

/**
 * 根据用户 ID 获取公开文章列表。
 */
const { data, pending, error, refresh } = useAsyncData<ApiPageData<Article.ArticleQueryRecord>>(
  key,
  () =>
    queryArticles({
      authorId: props.userId,
      visibility: 0,
      pageNumber: pageNumber.value,
      pageSize: pageSize.value,
      sort: [{ field: 'postTime', isAsc: false }]
    }),
  {
    watch: [() => props.userId, pageNumber, pageSize]
  }
)

watch(error, (err) => {
  if (!err) return
  toast.add({
    title: '获取文章失败',
    description: err.message ?? '请稍后再试',
    color: 'error'
  })
})

const articles = computed(() => data.value?.records ?? [])
const totalRow = computed(() => data.value?.totalRow ?? 0)

watch(
  () => props.userId,
  () => {
    pageNumber.value = 1
  }
)

/**
 * 删除文章。
 * @param {Event} event 点击事件
 * @param {number} articleId 文章 ID
 */
async function handleDeleteArticle(event: Event, articleId: number) {
  event.preventDefault()
  event.stopPropagation()

  const confirmed = confirm('确定要删除这篇文章吗?此操作不可撤销。')
  if (!confirmed) return

  try {
    await deleteArticle(articleId)
    toast.add({
      title: '删除成功',
      description: '文章已删除',
      color: 'success'
    })
    // 刷新列表
    await refresh()
  } catch (error) {
    console.error('删除文章失败', error)
    toast.add({
      title: '删除失败',
      description: error instanceof Error ? error.message : '请稍后再试',
      color: 'error'
    })
  }
}

/**
 * 编辑文章。
 * @param {Event} event 点击事件
 * @param {number} articleId 文章 ID
 */
function handleEditArticle(event: Event, articleId: number) {
  event.preventDefault()
  event.stopPropagation()
  navigateTo(`/articles/edit/${articleId}`)
}
</script>

<template>
  <section id="user-articles" class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h3 class="text-lg font-semibold">{{ title ?? 'Ta 的公开文章' }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">共 {{ totalRow }} 篇文章</p>
      </div>
      <UButton
        icon="i-lucide-refresh-cw"
        variant="ghost"
        color="neutral"
        :loading="pending"
        @click="() => refresh()"
      >
        刷新
      </UButton>
    </div>

    <div v-if="pending" class="space-y-2">
      <USkeleton v-for="index in 4" :key="index" class="h-16 w-full" />
    </div>

    <div v-else-if="articles.length" class="space-y-2">
      <NuxtLink
        v-for="article in articles"
        :key="article.id"
        :to="`/articles/${article.id}`"
        class="block"
      >
        <div
          class="flex items-center justify-between rounded border border-gray-200 p-4 transition hover:shadow-md dark:border-gray-700"
        >
          <div class="flex-1">
            <h4 class="text-base font-semibold">{{ article.title }}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              {{ 'primary' in article && article.primary ? article.primary : '暂无摘要' }}
            </p>
          </div>
          <div class="ml-4 flex items-center gap-2">
            <UBadge color="primary" variant="subtle">
              浏览 {{ (article as Article.ArticleInfo).views ?? 0 }}
            </UBadge>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ article.postTime }}
            </span>
            <!-- Owner controls -->
            <template v-if="isOwnArticles">
              <UButton
                icon="i-lucide-edit"
                size="xs"
                variant="ghost"
                color="neutral"
                @click="(e) => handleEditArticle(e, article.id)"
              />
              <UButton
                icon="i-lucide-trash-2"
                size="xs"
                variant="ghost"
                color="error"
                @click="(e) => handleDeleteArticle(e, article.id)"
              />
            </template>
          </div>
        </div>
      </NuxtLink>
    </div>

    <UAlert v-else variant="subtle" color="neutral" icon="i-lucide-info"> 尚无公开文章 </UAlert>

    <div v-if="totalRow > pageSize" class="flex justify-center">
      <UPagination v-model:page="pageNumber" :total="totalRow" :items-per-page="pageSize" />
    </div>
  </section>
</template>
