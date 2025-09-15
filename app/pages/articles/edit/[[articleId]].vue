<script lang="ts" setup>
import { createArticle, patchArticle } from '~/apis/article'
import { ARTICLE_VISIBILITY_OPTIONS } from '~~/shared/constants/article'
import { MdEditor } from 'md-editor-v3'
import { useDark } from '@vueuse/core'

/** Vue Route */
const route = useRoute()

/** 当前登录用户 */
const currentUser = useCurrentUser()

/** 文章 ID */
const articleId = (route.params.articleId as string) || ''

/** 黑暗模式 */
const isDark = useDark()

/** 编辑器模式 */
const isEditing = computed(() => articleId && articleId !== 'new')

/** 表单状态 */
const formData = reactive<
  Omit<Article.CreateArticleRequest & Article.PatchArticleRequest, 'id' | 'authorId' | 'postTime'>
>({
  title: '',
  primary: '',
  content: '',
  tags: [] as string[],
  comUseTags: [] as number[],
  visibility: 0
})

/** 表单加载状态 */
const saving = ref(false)

/** 获取已有文章数据（编辑模式） */
const {
  data: existingArticle,
  pending: loadingArticle,
  success: loadSuccess,
  message: loadMessage,
  refresh: refreshArticle
} = useApi<Article.ArticleDetail>(() => (isEditing.value ? `/article/${articleId}` : ''), {
  server: false,
  immediate: !!isEditing.value
})

/** 监听已有文章数据变化，填充表单 */
watch(
  existingArticle,
  (article) => {
    if (article) {
      Object.assign(formData, {
        title: article.title,
        primary: article.primary,
        content: article.content,
        partitionId: article.partitionId,
        tags: [...(article.tags || [])],
        comUseTags: [...(article.comUseTags || [])],
        visibility: article.visibility
      })
    }
  },
  { immediate: true }
)

/** 标签输入相关（已移除，改用 UInputTags） */

/** 常用标签输入相关 */
const comUseTagsAsStrings = computed({
  get: () => formData.comUseTags?.map(String) || [],
  set: (value: string[]) => {
    formData.comUseTags = value.map(Number).filter((num) => !isNaN(num) && num > 0)
  }
})

/** 保存文章 */
async function saveArticle() {
  // 用户未登录
  if (currentUser.userInfo?.id == null) return

  if (!formData.title.trim() || !formData.content.trim()) {
    // 显示错误提示
    return
  }

  saving.value = true

  try {
    if (isEditing.value) {
      // 更新文章
      await patchArticle({
        id: Number(articleId),
        ...formData
      })
    } else {
      // 创建文章
      const newArticle = await createArticle({
        authorId: currentUser.userInfo.id,
        ...formData
      })
      // 创建成功后跳转到文章详情页
      await navigateTo(`/articles/${newArticle.id}`)
      return
    }
    refreshArticle()
    // 编辑成功后跳转到文章详情页
    await navigateTo(`/articles/${articleId}`)
  } catch (error) {
    console.error('保存文章失败:', error)
    // 这里可以添加错误提示
  } finally {
    saving.value = false
  }
}

/** 导入 Markdown 文件 */
const fileInputRef = ref<HTMLInputElement>()

function triggerFileSelect() {
  fileInputRef.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 读取文件内容
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    if (!content) return
    // 导入内容到表单
    formData.content = content
    // 尝试从文件内容中提取标题（如果内容以 # 开头）
    const lines = content.split('\n')
    const firstLine = lines[0]?.trim()
    if (firstLine && firstLine.startsWith('#') && !formData.title.trim()) {
      formData.title = firstLine.replace(/^#+\s*/, '').trim()
    }
  }
  reader.readAsText(file)

  // 清空 input 值，以便重复选择同一文件
  target.value = ''
}

/** 返回上一页 */
function goBack() {
  if (isEditing.value) {
    navigateTo(`/articles/${articleId}`)
  } else {
    navigateTo('/')
  }
}

/** 页面标题 */
useHead(() => ({
  title: `${isEditing.value ? '编辑' : '创建'}文章 - Wolf Blog`
}))
</script>

<template>
  <div class="max-w-8xl mx-auto px-4 py-6">
    <!-- 返回按钮和页面标题 -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <UButton
          icon="i-lucide-arrow-left"
          variant="ghost"
          color="neutral"
          size="sm"
          @click="goBack"
        >
          返回
        </UButton>
        <h1 class="text-xl font-bold">
          {{ isEditing ? '编辑文章' : '创建文章' }}
        </h1>
      </div>

      <UButton
        icon="i-lucide-save"
        :loading="saving"
        :disabled="!formData.title.trim() || !formData.content.trim()"
        @click="saveArticle"
      >
        {{ isEditing ? '更新' : '发布' }}
      </UButton>
    </div>

    <!-- 加载状态 -->
    <div v-if="loadingArticle" class="space-y-4">
      <USkeleton class="h-10 w-full" />
      <USkeleton class="h-16 w-full" />
      <USkeleton class="h-80 w-full" />
    </div>

    <!-- 加载失败 -->
    <div v-else-if="isEditing && !loadSuccess" class="py-12 text-center">
      <UCard>
        <template #header>
          <div class="flex items-center gap-3 text-red-500">
            <UIcon name="i-lucide-alert-circle" class="h-6 w-6" />
            <h3 class="text-lg font-semibold">加载失败</h3>
          </div>
        </template>

        <div class="space-y-4">
          <p class="text-gray-600">{{ loadMessage }}</p>
          <UButton variant="outline" color="neutral" @click="() => refreshArticle()">
            重试
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- 编辑表单 -->
    <div v-else class="space-y-4">
      <!-- 基本信息和标签管理（合并） -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">文章信息</h2>
        </template>

        <div class="space-y-4">
          <!-- 文章标题 -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              文章标题 <span class="text-red-500">*</span>
            </label>
            <UInput v-model="formData.title" class="w-full" placeholder="请输入文章标题" />
          </div>

          <!-- 文章摘要 -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              文章摘要
            </label>
            <UTextarea
              v-model="formData.primary"
              class="w-full"
              placeholder="请输入文章摘要"
              :rows="2"
            />
          </div>

          <!-- 分区和可见性（一行排列） -->
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <!-- 分区 ID -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                分区 ID
              </label>
              <UInput
                v-model.number="formData.partitionId"
                class="w-full"
                type="number"
                placeholder="分区 ID"
                :min="1"
                size="sm"
              />
            </div>

            <!-- 可见性 -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                可见性
              </label>
              <USelect
                v-model="formData.visibility"
                class="w-full"
                :items="ARTICLE_VISIBILITY_OPTIONS"
                option-attribute="label"
                value-attribute="value"
                size="sm"
              />
            </div>
          </div>

          <!-- 标签管理 -->
          <div class="space-y-3">
            <!-- 普通标签 -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                标签
              </label>
              <UInputTags
                v-model="formData.tags"
                class="w-full"
                placeholder="输入标签后按回车添加..."
                icon="i-lucide-tag"
                size="sm"
                :max-length="20"
              />
            </div>

            <!-- 常用标签管理（可折叠） -->
            <UCollapsible>
              <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                icon="i-lucide-settings"
                trailing-icon="i-lucide-chevron-down"
                class="text-xs"
              >
                常用标签管理
              </UButton>

              <template #content>
                <div class="mt-2 space-y-2 rounded border border-gray-200 p-3 dark:border-gray-700">
                  <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">
                    输入数字 ID (例如: 1, 2, 3)
                  </label>
                  <UInputTags
                    v-model="comUseTagsAsStrings"
                    placeholder="输入标签 ID 后按回车添加..."
                    icon="i-lucide-hash"
                    size="sm"
                    :max-length="5"
                    type="number"
                  />
                </div>
              </template>
            </UCollapsible>
          </div>
        </div>
      </UCard>

      <!-- 文章内容 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">文章内容 <span class="text-red-500">*</span></h2>
            <div class="flex items-center gap-2">
              <UButton
                icon="i-lucide-file-text"
                variant="outline"
                color="neutral"
                @click="triggerFileSelect"
              >
                导入 MD 文件
              </UButton>
            </div>
          </div>
        </template>

        <div class="min-h-[500px]">
          <MdEditor
            v-model="formData.content"
            placeholder="请输入文章内容，支持 Markdown 语法..."
            :theme="isDark ? 'dark' : 'light'"
            :preview="true"
            :toolbars="[
              'bold',
              'underline',
              'italic',
              '-',
              'title',
              'strikeThrough',
              'sub',
              'sup',
              'quote',
              'unorderedList',
              'orderedList',
              'task',
              '-',
              'codeRow',
              'code',
              'link',
              'image',
              'table',
              'mermaid',
              'katex',
              '-',
              'revoke',
              'next',
              'save',
              '=',
              'pageFullscreen',
              'fullscreen',
              'preview',
              'htmlPreview',
              'catalog'
            ]"
          />
        </div>
      </UCard>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".md,.markdown,.txt"
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</template>
