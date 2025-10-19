<script lang="ts" setup>
/** 当前登录用户 */
const currentUser = useCurrentUser()
const { isLoggedIn } = storeToRefs(currentUser)

/** 文章列表查询参数 */
const query = reactive<Article.ArticleListQuery>({
  pageNumber: 1,
  pageSize: 20
})

/** 文章列表数据 */
const {
  data: articleList,
  status,
  pending,
  success,
  code,
  message,
  refresh: refreshArticleList
} = useApi<ApiPageData<Article.ArticleInfo>>('/article/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/nullable+json' },
  body: query
})

/** 搜索相关 */
const searchQuery = ref('')
const searchTimeout = ref<NodeJS.Timeout>()

/** 筛选选项 */
const sortOptions = [
  { label: '最新发布', value: 'postTime_desc' },
  { label: '最早发布', value: 'postTime_asc' },
  { label: '标题 A-Z', value: 'title_asc' },
  { label: '标题 Z-A', value: 'title_desc' }
]

/** 选中的筛选选项 */
const selectedSort = ref('postTime_desc')

/** 日期范围 */
const calendarDateRange = ref()

/** 日期范围转换器 */
const dateRange = computed({
  get: () => calendarDateRange.value,
  set: (value) => {
    calendarDateRange.value = value
    // 自动触发筛选应用
    nextTick(() => {
      applyFilters()
    })
  }
})

/** 搜索防抖处理 */
function handleSearch() {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = setTimeout(() => {
    if (searchQuery.value.trim()) {
      query.title = searchQuery.value.trim()
    } else {
      delete query.title
    }
    query.pageNumber = 1 // 重置到第一页
  }, 500)
}

/** 应用筛选 */
function applyFilters() {
  // 日期范围筛选
  if (calendarDateRange.value?.start) {
    // 将 Date 对象转换为 ISO 字符串
    const startDate =
      calendarDateRange.value.start instanceof Date
        ? calendarDateRange.value.start
        : new Date(calendarDateRange.value.start)
    query.postStart = startDate.toISOString()
  } else {
    delete query.postStart
  }

  if (calendarDateRange.value?.end) {
    // 将 Date 对象转换为 ISO 字符串
    const endDate =
      calendarDateRange.value.end instanceof Date
        ? calendarDateRange.value.end
        : new Date(calendarDateRange.value.end)
    query.postEnd = endDate.toISOString()
  } else {
    delete query.postEnd
  }

  query.pageNumber = 1 // 重置到第一页
}

/** 清除筛选 */
function clearFilters() {
  searchQuery.value = ''
  selectedSort.value = 'postTime_desc'
  dateRange.value = {}

  // 清除查询参数，保留分页信息
  const newQuery: Article.ArticleListQuery = {
    pageNumber: 1,
    pageSize: query.pageSize || 20
  }
  Object.assign(query, newQuery)
}

/** 返回顶部 */
function scrollToTop() {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

/** 手动刷新文章列表 */
function handleRefresh() {
  refreshArticleList()
}

/** 监听页码变化，滚动到顶部 */
watch(
  () => query.pageNumber,
  (newPage, oldPage) => {
    if (newPage && oldPage && newPage !== oldPage && newPage > 1) {
      nextTick(() => {
        scrollToTop()
      })
    }
  }
)

/** 监听搜索输入 */
watch(searchQuery, handleSearch)

/** 监听筛选选项变化 */
watch(dateRange, applyFilters, { deep: true })

/** 页面标题 */
useHead({
  title: 'Wolf Blog - 文章列表',
  meta: [{ name: 'description', content: '浏览所有精彩文章，发现有趣的内容和观点' }]
})

/** 跳转至新建文章页面 */
function goToNewArticle() {
  if (isLoggedIn.value) navigateTo('/articles/edit')
  else navigateTo({ path: '/user/login', query: { redirect: '/articles/edit' } })
}
</script>

<template>
  <div class="max-w-7xl py-6">
    <div class="flex flex-row gap-4">
      <!-- 文章列表内容 -->
      <div class="flex-grow">
        <!-- 文章列表页头 -->
        <div class="mb-6 flex w-full flex-row gap-2">
          <!-- 搜索框 -->
          <UInput
            v-model="searchQuery"
            placeholder="搜索文章标题..."
            leading-icon="i-lucide-search"
            size="xl"
            class="flex-grow rounded-md bg-[var(--ui-bg)] shadow-lg"
            variant="none"
          />
          <!-- 排序选择器 -->
          <USelect
            v-model="selectedSort"
            :items="sortOptions"
            option-text="label"
            value-attribute="value"
            placeholder="排序"
            icon="i-lucide-arrow-up-down"
            size="xl"
            class="hover:bg-accented/75 flex-shrink-0 bg-[var(--ui-bg)] shadow-lg"
            variant="none"
          />
          <!-- 高级筛选 -->
          <UPopover>
            <UButton
              icon="i-lucide-filter"
              size="xl"
              trailing-icon="i-lucide-chevron-down"
              class="hover:bg-accented/75 flex-shrink-0 bg-[var(--ui-bg)] shadow-lg"
              variant="soft"
              color="neutral"
            />
            <template #content>
              <div class="w-80 rounded-lg bg-[var(--ui-bg)] p-4 max-lg:right-auto lg:max-w-80">
                <div class="mb-3 flex items-center justify-between">
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">高级筛选</h3>
                  <UButton icon="i-lucide-filter-x" variant="ghost" size="xs" @click="clearFilters">
                    清除
                  </UButton>
                </div>

                <div class="space-y-3">
                  <!-- 用户和分区筛选 -->
                  <div class="grid grid-cols-2 gap-3">
                    <UInput
                      v-model.number="query.authorId"
                      type="number"
                      placeholder="作者ID"
                      size="sm"
                      :min="1"
                    />
                    <UInput
                      v-model.number="query.partitionId"
                      type="number"
                      placeholder="分区ID"
                      size="sm"
                      :min="1"
                    />
                  </div>

                  <!-- 日期范围筛选 -->
                  <div class="space-y-2">
                    <label class="text-xs font-medium text-gray-700 dark:text-gray-300">
                      发布时间范围
                    </label>
                    <UCalendar v-model="dateRange" range size="sm" color="primary" class="w-full" />
                  </div>
                </div>
              </div>
            </template>
          </UPopover>
          <!-- 分页大小 -->
          <USelect
            v-model="query.pageSize"
            :items="[
              { label: '10', value: 10 },
              { label: '20', value: 20 },
              { label: '50', value: 50 }
            ]"
            option-attribute="label"
            value-attribute="value"
            size="xl"
            class="hover:bg-accented/75 flex-shrink-0 bg-[var(--ui-bg)] shadow-lg"
            variant="none"
          >
            <template #default="{ modelValue }">
              每页 <span class="text-primary">{{ modelValue }}</span> 条
            </template>
          </USelect>
          <!-- 刷新 -->
          <UButton
            icon="i-lucide-refresh-cw"
            size="xl"
            class="flex-shrink-0 bg-[var(--ui-bg)] shadow-lg"
            variant="soft"
            color="neutral"
            @click="handleRefresh"
          />
        </div>
        <!-- 加载状态骨架屏 -->
        <div v-if="pending" class="space-y-4">
          <div v-for="i in Math.min(query.pageSize || 20, 5)" :key="i" class="p-4">
            <UCard class="p-4">
              <!-- 文章标题骨架 -->
              <USkeleton class="mb-3 h-6 w-3/4" />

              <!-- 文章摘要骨架 -->
              <div class="mb-4 space-y-2">
                <USkeleton class="h-4 w-full" />
                <USkeleton class="h-4 w-5/6" />
              </div>

              <!-- 文章信息骨架 -->
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-1">
                  <USkeleton class="h-4 w-4 rounded" />
                  <USkeleton class="h-4 w-16" />
                </div>
                <div class="flex items-center gap-1">
                  <USkeleton class="h-4 w-4 rounded" />
                  <USkeleton class="h-4 w-24" />
                </div>
                <div class="flex items-center gap-1">
                  <USkeleton class="h-4 w-4 rounded" />
                  <USkeleton class="h-4 w-12" />
                </div>
                <div class="flex items-center gap-1">
                  <USkeleton class="h-4 w-4 rounded" />
                  <USkeleton class="h-4 w-10" />
                </div>
                <div class="flex items-center gap-1">
                  <USkeleton class="h-4 w-4 rounded" />
                  <USkeleton class="h-4 w-8" />
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <!-- 错误状态 -->
        <div
          v-else-if="status === 'error' && message"
          class="flex items-center justify-center py-8"
        >
          <UAlert
            icon="i-lucide-alert-circle"
            color="error"
            variant="subtle"
            :title="`加载文章列表失败 (错误码: ${code})`"
            :description="message"
          />
        </div>

        <!-- 文章列表内容 -->
        <div
          v-else-if="success && articleList?.records && articleList.records.length > 0"
          class="space-y-4"
        >
          <UCard
            v-for="article in articleList.records"
            :key="article.id"
            class="shadow-lg transition-shadow duration-200 hover:shadow-xl"
          >
            <div>
              <NuxtLink :to="`/articles/${article.id}`" class="group block">
                <h3 class="text-lg font-semibold text-gray-900 transition-colors dark:text-white">
                  {{ article.title }}
                </h3>
                <div
                  v-if="article.primary"
                  class="mt-1 line-clamp-2 text-gray-600 dark:text-gray-300"
                >
                  {{ article.primary }}
                </div>
                <div class="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div class="flex items-center gap-1">
                    <UIcon name="i-lucide-user" class="h-4 w-4" />
                    <ULink :to="`/user/${article.author?.id}`">{{
                      article.author?.nickname ?? article.author?.account
                    }}</ULink>
                  </div>
                  <div v-if="article.postTime" class="flex items-center gap-1">
                    <UIcon name="i-lucide-calendar" class="h-4 w-4" />
                    <span>{{ formatDateTime(article.postTime, 'YYYY-MM-DD HH:mm') }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <UIcon name="i-lucide-eye" class="h-4 w-4" />
                    <span>{{ article.views }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <UIcon name="i-lucide-thumbs-up" class="h-4 w-4" />
                    <span>{{ article.likeCount }}</span>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </UCard>

          <!-- 分页信息和控件 -->
          <div v-if="articleList.totalRow > 0" class="mt-8 space-y-4">
            <!-- 分页信息 -->
            <div class="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
              <span>
                共 {{ articleList.totalRow }} 篇文章，第 {{ articleList.currentPage }} /
                {{ articleList.totalPage }} 页 (每页 {{ query.pageSize || 20 }} 篇)
              </span>
            </div>

            <!-- 分页控件 -->
            <div v-if="articleList.totalPage > 1" class="flex justify-center">
              <UPagination
                v-model:page="query.pageNumber"
                :total="articleList.totalRow"
                :items-per-page="query.pageSize || 20"
                :sibling-count="1"
                show-edges
              />
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-12">
          <UIcon name="i-lucide-file-text" class="mb-4 h-12 w-12 text-gray-400" />
          <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">暂无文章</h3>
          <p class="mb-6 text-center text-gray-500 dark:text-gray-400">
            还没有发布任何文章，快来创建第一篇文章吧！
          </p>
          <UButton icon="i-lucide-plus" color="primary" @click="goToNewArticle">
            写第一篇文章
          </UButton>
        </div>

        <!-- 返回顶部按钮 -->
        <div class="mt-8 flex justify-center">
          <UButton icon="i-lucide-arrow-up" variant="outline" color="neutral" @click="scrollToTop">
            返回顶部
          </UButton>
        </div>
      </div>

      <!-- 个人名片、文章分类 -->
      <div class="w-60 space-y-4">
        <!-- 写文章 -->
        <UButton
          icon="i-lucide-edit"
          color="primary"
          variant="solid"
          size="xl"
          class="mb-6 w-60 justify-center shadow-lg"
          @click="goToNewArticle"
        >
          写文章
        </UButton>
        <!-- 个人信息 -->
        <div class="rounded-lg bg-[var(--ui-bg)] p-4 shadow-lg">
          <div class="flex w-full flex-col items-center">
            <!-- 头像 -->
            <UAvatar
              :src="currentUser.userInfo?.avatar ?? undefined"
              :alt="currentUser.userInfo?.username"
              size="xl"
              class="h-24 w-24 rounded-full text-center"
            />
            <!-- 用户名 -->
            <div class="mt-2 text-center text-lg font-semibold text-gray-900 dark:text-white">
              {{ currentUser.userInfo?.username || '游客' }}
            </div>
            <!-- 账号 -->
            <div class="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
              {{ currentUser.userInfo?.account || '未登录' }}
            </div>
            <!-- 个性签名 -->
            <div
              v-if="currentUser.userInfo?.personalStatus"
              class="mt-2 text-center text-sm text-gray-600 dark:text-gray-300"
            >
              {{ currentUser.userInfo?.personalStatus }}
            </div>
            <!-- 个人快捷导航 -->
            <div class="mt-3 flex w-full flex-row items-center justify-between">
              <!-- 个人主页 -->
              <UButton
                icon="i-lucide-user-circle"
                variant="ghost"
                size="lg"
                class="flex-grow justify-center"
                color="neutral"
                :to="currentUser.isLoggedIn ? `/user/${currentUser.userInfo?.id}` : '/user/login'"
              />
              <!-- 收藏 -->
              <UButton
                icon="i-lucide-bookmark"
                variant="ghost"
                size="lg"
                class="flex-grow justify-center"
                color="neutral"
                :to="currentUser.isLoggedIn ? '/user/favorites' : '/user/login'"
              />
              <!-- 评论管理 -->
              <UButton
                icon="i-lucide-message-circle"
                variant="ghost"
                size="lg"
                class="flex-grow justify-center"
                color="neutral"
                :to="currentUser.isLoggedIn ? '/user/comments' : '/user/login'"
              />
              <!-- 设置 -->
              <UButton
                icon="i-lucide-settings"
                variant="ghost"
                size="lg"
                class="flex-grow justify-center"
                color="neutral"
                :to="currentUser.isLoggedIn ? '/user/settings' : '/user/login'"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
