<script lang="ts" setup>
import { createTag, deleteTags, getTags, putTag } from '@/apis/article'

/**
 * 常用标签管理组件属性。
 * @property {number[] | null | undefined} modelValue - 当前选中的常用标签 ID 列表，支持受控与非受控用法。
 */
const props = withDefaults(
  defineProps<{
    /** 选中的常用标签 ID 列表 */
    modelValue?: number[] | null
  }>(),
  {
    modelValue: () => []
  }
)

/**
 * 组件向父级发出的事件。
 * @event update:modelValue - 当常用标签选中状态变更时触发，携带去重后的标签 ID 列表。
 */
const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const toast = useToast()

/**
 * 获取常用标签列表的异步数据状态。
 * 使用 `useAsyncData` 以保持 SSR 安全，且仅在客户端拉取数据。
 */
const {
  data: commonTags,
  pending: loadingCommonTags,
  status: loadCommonTagsStatus,
  error: loadCommonTagsError,
  refresh: refreshCommonTags
} = useAsyncData<Article.Tag[]>('article-common-tags', () => getTags(), {
  server: false,
  immediate: true
})

/**
 * 指示常用标签列表是否成功加载。
 * @returns {boolean}
 */
const loadCommonTagsSuccess = computed(() => loadCommonTagsStatus.value === 'success')

/**
 * 常用标签加载失败时的错误提示文案。
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

/** 可编辑的常用标签副本，避免直接修改原始响应式数据。 */
const editableTags = ref<Article.Tag[]>([])
/** 新建常用标签输入的临时值。 */
const newTagName = ref('')

/**
 * 常用标签相关的异步操作状态集合。
 * - `creating`：是否正在创建新标签
 * - `updating`：以标签 ID 为键的更新状态映射
 * - `deleting`：以标签 ID 为键的删除状态映射
 */
const tagActionState = reactive({
  creating: false,
  updating: {} as Record<number, boolean>,
  deleting: {} as Record<number, boolean>
})

/** 当前选中的常用标签 ID 列表（去除 null/undefined）。 */
const selectedTagIds = computed(() => Array.from(props.modelValue ?? []))
/** 快速判断标签是否被选中的集合。 */
const selectedTagIdSet = computed(() => new Set(selectedTagIds.value))

/**
 * 同步常用标签数据变化：
 * - 维护本地可编辑副本
 * - 清理已不存在的选中标签 ID
 */
watch(
  commonTags,
  (tags) => {
    if (tags) {
      editableTags.value = tags.map((tag) => ({ ...tag }))
      const availableIds = new Set(tags.map((tag) => tag.id))
      const filtered = selectedTagIds.value.filter((id) => availableIds.has(id))
      if (filtered.length !== selectedTagIds.value.length) {
        emit('update:modelValue', filtered)
      }
    } else {
      editableTags.value = []
      if (selectedTagIds.value.length > 0) {
        emit('update:modelValue', [])
      }
    }
  },
  { immediate: true }
)

/**
 * 更新选中的常用标签列表。
 * @param {number[]} next - 下一步的标签 ID 集合。
 */
function updateSelectedTags(next: number[]) {
  emit('update:modelValue', Array.from(new Set(next)))
}

/**
 * 判断指定标签是否已被选中。
 * @param {number} tagId - 常用标签 ID。
 * @returns {boolean}
 */
function isCommonTagSelected(tagId: number) {
  return selectedTagIdSet.value.has(tagId)
}

/**
 * 设置常用标签是否应用到当前文章。
 * @param {number} tagId - 常用标签 ID。
 * @param {boolean} selected - 是否选中。
 */
function setCommonTagSelected(tagId: number, selected: boolean) {
  const current = selectedTagIds.value
  if (selected) {
    if (!current.includes(tagId)) {
      updateSelectedTags([...current, tagId])
    }
  } else {
    updateSelectedTags(current.filter((id) => id !== tagId))
  }
}

/**
 * 统一处理 API 调用错误并给出用户提示。
 * @param {unknown} error - 原始错误对象。
 * @param {string} fallbackMessage - 默认提示文案。
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
 * @returns {Promise<void>}
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
 * 更新指定常用标签的名称。
 * @param {number} tagId - 常用标签 ID。
 * @returns {Promise<void>}
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
 * 删除指定常用标签。
 * @param {number} tagId - 常用标签 ID。
 * @returns {Promise<void>}
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
    if (selectedTagIds.value.includes(tagId)) {
      setCommonTagSelected(tagId, false)
    }
    await refreshCommonTags()
  } catch (error) {
    handleApiError(error, '删除常用标签失败')
  } finally {
    tagActionState.deleting[tagId] = false
  }
}

/**
 * 判断常用标签是否处于更新中。
 * @param {number} tagId - 常用标签 ID。
 * @returns {boolean}
 */
function isUpdatingTag(tagId: number) {
  return tagActionState.updating[tagId] === true
}

/**
 * 判断常用标签是否处于删除中。
 * @param {number} tagId - 常用标签 ID。
 * @returns {boolean}
 */
function isDeletingTag(tagId: number) {
  return tagActionState.deleting[tagId] === true
}
</script>

<template>
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
            <UInput v-model="newTagName" class="w-full" size="sm" placeholder="请输入标签名称" />
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
                @update:model-value="(value) => setCommonTagSelected(tag.id, value === true)"
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
</template>
