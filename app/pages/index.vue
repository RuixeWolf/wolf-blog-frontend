<script lang="ts" setup>
/** 文章列表查询参数 */
const query = reactive<Article.ArticleListQuery>({
  pageNumber: 1,
  pageSize: 20
})

/** 搜索相关 */
const searchQuery = ref('')
const searchTimeout = ref<NodeJS.Timeout>()

/** 筛选选项 */
const sortOptions = [
  { label: '最新发布', value: 'postTime_desc' },
  { label: '最早发布', value: 'postTime_asc' },
  { label: '标题A-Z', value: 'title_asc' },
  { label: '标题Z-A', value: 'title_desc' }
]

/** 选中的筛选选项 */
const selectedSort = ref('postTime_desc')

/** 日期范围 */
const dateRange = ref<{ start?: string; end?: string }>({})

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
  if (dateRange.value.start) {
    query.postStart = dateRange.value.start
  } else {
    delete query.postStart
  }

  if (dateRange.value.end) {
    query.postEnd = dateRange.value.end
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

/** 监听搜索输入 */
watch(searchQuery, handleSearch)

/** 监听筛选选项变化 */
watch(dateRange, applyFilters, { deep: true })

/** 页面标题 */
useHead({
  title: 'Wolf Blog - 文章列表',
  meta: [{ name: 'description', content: '浏览所有精彩文章，发现有趣的内容和观点' }]
})
</script>

<template>
  <div class="container mx-auto py-8">
    <!-- 页面标题和操作 -->
    <div class="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">文章列表</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">发现精彩内容，探索更多观点</p>
      </div>

      <!-- 新建文章按钮 -->
      <UButton icon="i-lucide-plus" color="primary" variant="solid" size="lg" to="/articles/edit">
        写文章
      </UButton>
    </div>

    <!-- 搜索和筛选区域 -->
    <UCard class="mb-8">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-search" class="h-5 w-5 text-gray-500" />
            <h2 class="text-lg font-semibold">搜索与筛选</h2>
          </div>

          <!-- 快捷操作按钮 -->
          <div class="flex gap-2">
            <UButton icon="i-lucide-filter-x" variant="ghost" size="sm" @click="clearFilters">
              清除
            </UButton>
            <UButton icon="i-lucide-refresh-cw" variant="ghost" size="sm" @click="$forceUpdate()">
              刷新
            </UButton>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <!-- 基础搜索 - 始终显示 -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UInput
            v-model="searchQuery"
            placeholder="搜索文章标题..."
            icon="i-lucide-search"
            size="lg"
          >
            <template #trailing>
              <UButton
                v-if="searchQuery"
                icon="i-lucide-x"
                variant="ghost"
                color="neutral"
                size="xs"
                @click="searchQuery = ''"
              />
            </template>
          </UInput>

          <!-- 排序方式 -->
          <USelect
            v-model="selectedSort"
            :options="sortOptions"
            option-attribute="label"
            value-attribute="value"
            placeholder="选择排序方式"
            icon="i-lucide-arrow-up-down"
            size="lg"
          />
        </div>

        <!-- 高级筛选折叠面板 -->
        <UCollapsible>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-filter"
            trailing-icon="i-lucide-chevron-down"
            label="高级筛选选项"
            class="w-full justify-between"
          />

          <template #content>
            <div class="space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              <!-- 用户和分区筛选 -->
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    作者ID
                  </label>
                  <UInput
                    v-model.number="query.authorId"
                    type="number"
                    placeholder="输入作者ID"
                    icon="i-lucide-user"
                    :min="1"
                  />
                </div>

                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    分区ID
                  </label>
                  <UInput
                    v-model.number="query.partitionId"
                    type="number"
                    placeholder="输入分区ID"
                    icon="i-lucide-hash"
                    :min="1"
                  />
                </div>
              </div>

              <!-- 日期范围筛选 -->
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  发布时间范围
                </label>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <UInput
                    v-model="dateRange.start"
                    type="datetime-local"
                    placeholder="开始时间"
                    icon="i-lucide-calendar"
                  />
                  <UInput
                    v-model="dateRange.end"
                    type="datetime-local"
                    placeholder="结束时间"
                    icon="i-lucide-calendar"
                  />
                </div>
              </div>
            </div>
          </template>
        </UCollapsible>
      </div>
    </UCard>

    <!-- 文章列表区域 -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-file-text" class="h-5 w-5 text-gray-500" />
            <h2 class="text-lg font-semibold">文章列表</h2>
          </div>

          <!-- 分页大小选择 -->
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>每页</span>
            <USelect
              v-model="query.pageSize"
              :options="[
                { label: '10', value: 10 },
                { label: '20', value: 20 },
                { label: '50', value: 50 }
              ]"
              option-attribute="label"
              value-attribute="value"
              size="sm"
              class="w-16"
            />
            <span>条</span>
          </div>
        </div>
      </template>

      <!-- 文章列表组件 -->
      <ArticleList :query="query" />
    </UCard>

    <!-- 返回顶部按钮 -->
    <div class="mt-8 flex justify-center">
      <UButton icon="i-lucide-arrow-up" variant="outline" color="neutral" @click="scrollToTop">
        返回顶部
      </UButton>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
.container {
  max-width: 1200px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
}
</style>
