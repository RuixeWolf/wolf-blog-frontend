<script lang="ts" setup>
import { createArticle, createTag, deleteTags, getTags, patchArticle, putTag } from '~/apis/article'
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

/** 通知 */
const toast = useToast()

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

/**
 * 常用标签列表。
 *
 * @see getTags
 */
const {
  data: commonTags,
  pending: loadingCommonTags,
  status: loadCommonTagsStatus,
  error: loadCommonTagsError,
  refresh: refreshCommonTags
} = useAsyncData('article-common-tags', () => getTags(), {
  server: false,
  immediate: true
})

/**
 * 指示常用标签列表是否加载成功。
 *
 * @returns {boolean}
 */
const loadCommonTagsSuccess = computed(() => loadCommonTagsStatus.value === 'success')

/**
 * 常用标签加载失败时展示的提示文案。
 *
 * @returns {string}
 */
const loadCommonTagsMessage = computed(() => {
  const error = loadCommonTagsError.value
  if (!error) return ''
  if (error instanceof ApiError) {
    return `${error.message} (${error.code})`
  }
  return error.message || '未知错误'
})

/**
 * 可编辑的常用标签列表，避免直接修改响应式源数据。
 */
const editableTags = ref<Article.Tag[]>([])

/**
 * 同步常用标签数据变化到可编辑列表，并清理已失效的选中项。
 */
watch(
  commonTags,
  (tags) => {
    if (tags) {
      editableTags.value = tags.map((tag) => ({ ...tag }))
      if (Array.isArray(formData.comUseTags) && formData.comUseTags.length > 0) {
        const availableIds = new Set(tags.map((tag) => tag.id))
        const filtered = formData.comUseTags.filter((id) => availableIds.has(id))
        if (filtered.length !== formData.comUseTags.length) {
          formData.comUseTags = filtered
        }
      }
    } else {
      editableTags.value = []
    }
  },
  { immediate: true }
)

/**
 * 新建常用标签时使用的输入值。
 */
const newTagName = ref('')

/**
 * 常用标签操作的加载状态。
 */
const tagActionState = reactive({
  creating: false,
  updating: {} as Record<number, boolean>,
  deleting: {} as Record<number, boolean>
})

/**
 * 文章当前选中的常用标签集合。
 */
const selectedCommonTagIds = computed(() => new Set(formData.comUseTags ?? []))

/**
 * 判断常用标签是否已关联到当前文章。
 *
 * @param {number} tagId 常用标签 ID。
 * @returns {boolean}
 */
function isCommonTagSelected(tagId: number) {
  return selectedCommonTagIds.value.has(tagId)
}

/**
 * 更新文章选中常用标签列表。
 *
 * @param {number} tagId 常用标签 ID。
 * @param {boolean} selected 是否选中。
 */
function setCommonTagSelected(tagId: number, selected: boolean) {
  const current = formData.comUseTags ?? []
  if (selected) {
    if (!current.includes(tagId)) {
      formData.comUseTags = [...current, tagId]
    }
  } else {
    formData.comUseTags = current.filter((id) => id !== tagId)
  }
}

/**
 * 统一处理 API 错误并提示用户。
 *
 * @param {unknown} error 原始错误。
 * @param {string} fallbackMessage 默认提示文案。
 */
function handleApiError(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    toast.add({
      title: fallbackMessage,
      description: `${error.message} (${error.code})`,
      color: 'error'
    })
  } else {
    console.error(fallbackMessage, error)
    toast.add({
      title: fallbackMessage,
      description: '发生未知错误，请稍后再试',
      color: 'error'
    })
  }
}

/**
 * 创建新的常用标签。
 */
async function createCommonTag() {
  const name = newTagName.value.trim()
  if (!name) {
    toast.add({
      title: '请输入标签名称',
      color: 'warning'
    })
    return
  }

  tagActionState.creating = true
  try {
    await createTag({ name })
    toast.add({
      title: '创建成功',
      description: `已添加常用标签「${name}」`,
      color: 'success'
    })
    newTagName.value = ''
    await refreshCommonTags()
  } catch (error) {
    handleApiError(error, '创建常用标签失败')
  } finally {
    tagActionState.creating = false
  }
}

/**
 * 更新指定常用标签名称。
 *
 * @param {number} tagId 常用标签 ID。
 */
async function updateCommonTag(tagId: number) {
  const target = editableTags.value.find((tag) => tag.id === tagId)
  if (!target) return

  const trimmedName = target.name.trim()
  if (!trimmedName) {
    toast.add({
      title: '标签名称不能为空',
      color: 'warning'
    })
    return
  }

  const original = commonTags.value?.find((tag) => tag.id === tagId)
  if (original && original.name === trimmedName) {
    toast.add({
      title: '无需更新',
      description: '标签名称未发生变化',
      color: 'neutral'
    })
    return
  }

  tagActionState.updating[tagId] = true
  try {
    await putTag({ id: tagId, name: trimmedName })
    toast.add({
      title: '更新成功',
      description: `标签已更新为「${trimmedName}」`,
      color: 'success'
    })
    await refreshCommonTags()
  } catch (error) {
    handleApiError(error, '更新常用标签失败')
  } finally {
    tagActionState.updating[tagId] = false
  }
}

/**
 * 删除常用标签。
 *
 * @param {number} tagId 常用标签 ID。
 */
async function deleteCommonTag(tagId: number) {
  if (!confirm('确定要删除该常用标签吗？')) {
    return
  }

  tagActionState.deleting[tagId] = true
  try {
    await deleteTags({ ids: [tagId] })
    toast.add({
      title: '删除成功',
      description: `已删除常用标签 #${tagId}`,
      color: 'success'
    })
    if (formData.comUseTags?.includes(tagId)) {
      formData.comUseTags = formData.comUseTags.filter((id) => id !== tagId)
    }
    await refreshCommonTags()
  } catch (error) {
    handleApiError(error, '删除常用标签失败')
  } finally {
    tagActionState.deleting[tagId] = false
  }
}

/**
 * 判断常用标签是否处于更新中的状态。
 *
 * @param {number} tagId 常用标签 ID。
 * @returns {boolean}
 */
function isUpdatingTag(tagId: number) {
  return tagActionState.updating[tagId] === true
}

/**
 * 判断常用标签是否处于删除中的状态。
 *
 * @param {number} tagId 常用标签 ID。
 * @returns {boolean}
 */
function isDeletingTag(tagId: number) {
  return tagActionState.deleting[tagId] === true
}

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
                <div class="mt-2 space-y-4 rounded border border-gray-200 p-3 dark:border-gray-700">
                  <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div class="flex-1">
                      <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        新建常用标签
                      </label>
                      <UInput
                        v-model="newTagName"
                        class="w-full"
                        size="sm"
                        placeholder="请输入标签名称"
                      />
                    </div>
                    <UButton
                      icon="i-lucide-plus"
                      size="sm"
                      :loading="tagActionState.creating"
                      :disabled="tagActionState.creating || !newTagName.trim()"
                      @click="createCommonTag"
                    >
                      添加
                    </UButton>
                  </div>

                  <div class="flex items-center justify-between">
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      选择常用标签可快速应用到文章，支持直接编辑名称。
                    </p>
                    <UButton
                      variant="ghost"
                      size="xs"
                      icon="i-lucide-refresh-cw"
                      :loading="loadingCommonTags"
                      @click="() => refreshCommonTags()"
                    >
                      刷新
                    </UButton>
                  </div>

                  <div v-if="loadingCommonTags" class="space-y-2">
                    <USkeleton v-for="i in 3" :key="i" class="h-10 w-full" />
                  </div>
                  <UAlert
                    v-else-if="!loadCommonTagsSuccess"
                    icon="i-lucide-alert-circle"
                    color="error"
                    variant="soft"
                    title="加载常用标签失败"
                    :description="loadCommonTagsMessage"
                  />
                  <div
                    v-else-if="editableTags.length === 0"
                    class="rounded border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400"
                  >
                    暂无常用标签，创建后可在此管理。
                  </div>
                  <div v-else class="space-y-3">
                    <div
                      v-for="tag in editableTags"
                      :key="tag.id"
                      class="flex flex-wrap items-center gap-3 rounded border border-gray-200 p-3 dark:border-gray-700"
                    >
                      <div class="flex items-center gap-3">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          #{{ tag.id }}
                        </span>
                        <UCheckbox
                          :model-value="isCommonTagSelected(tag.id)"
                          label="用于当前文章"
                          size="sm"
                          @update:model-value="
                            (value) => setCommonTagSelected(tag.id, value === true)
                          "
                        />
                      </div>

                      <UInput
                        v-model="tag.name"
                        size="sm"
                        class="min-w-[180px] flex-1"
                        placeholder="标签名称"
                      />

                      <div class="flex items-center gap-2">
                        <UButton
                          size="xs"
                          variant="outline"
                          :loading="isUpdatingTag(tag.id)"
                          @click="updateCommonTag(tag.id)"
                        >
                          保存
                        </UButton>
                        <UButton
                          size="xs"
                          color="error"
                          variant="outline"
                          :loading="isDeletingTag(tag.id)"
                          @click="deleteCommonTag(tag.id)"
                        >
                          删除
                        </UButton>
                      </div>
                    </div>
                  </div>
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
