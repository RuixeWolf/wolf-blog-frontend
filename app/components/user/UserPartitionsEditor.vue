<script setup lang="ts">
import { ApiError } from '~~/shared/types/ApiError'
import { computed, reactive, ref, toRefs } from 'vue'
import {
  createArticlePartition,
  deleteArticlePartition,
  deleteArticlePartitionCascade,
  patchArticlePartition
} from '@/apis/article/partition'

interface PartitionRow {
  partition: Article.Partition
  depth: number
}

/**
 * 分区编辑器组件的传入属性定义。
 */
const props = defineProps<{
  /** 分区行数据，包含层级信息，用于构建父分区选择 */
  partitionRows: PartitionRow[]
  /** 新建弹窗显示状态 */
  showCreateModal: boolean
  /** 编辑弹窗显示状态 */
  showEditModal: boolean
  /** 删除弹窗显示状态 */
  showDeleteModal: boolean
  /** 创建子分区时的父分区 ID */
  createParentId: number | null
  /** 当前编辑的分区 */
  editPartition: Article.Partition | null
  /** 当前删除的分区 */
  deletePartition: Article.Partition | null
}>()

/**
 * 将传入属性解构为响应式引用。
 */
const {
  partitionRows,
  showCreateModal,
  showEditModal,
  showDeleteModal,
  createParentId,
  editPartition,
  deletePartition
} = toRefs(props)

/**
 * 组件对外暴露的事件定义。
 */
const emit = defineEmits<{
  /** 关闭新建弹窗 */
  closeCreateModal: []
  /** 关闭编辑弹窗 */
  closeEditModal: []
  /** 关闭删除弹窗 */
  closeDeleteModal: []
  /** 分区创建成功 */
  partitionCreated: []
  /** 分区更新成功 */
  partitionUpdated: []
  /** 分区删除成功 */
  partitionDeleted: []
}>()

const toast = useToast()

/** 接口请求状态，用于禁用按钮与展示 loading。 */
const isCreating = ref(false)
const isUpdating = ref(false)
const isDeleting = ref(false)

/**
 * 新建分区表单状态。
 */
const createForm = reactive({
  /** 分区名称 */
  name: '',
  /** 可见性，0 为公开，1 为私密 */
  visibility: 0 as 0 | 1,
  /** 父分区 ID，null 表示顶级 */
  parentId: null as number | null
})

/**
 * 编辑分区表单状态。
 */
const editForm = reactive({
  /** 分区 ID */
  id: 0,
  /** 分区名称 */
  name: '',
  /** 可见性 */
  visibility: 0 as 0 | 1,
  /** 排序值 */
  order: 0,
  /** 父分区 ID */
  parentId: null as number | null
})

/**
 * 删除分区确认表单状态。
 */
const deleteForm = reactive({
  /** 分区 ID */
  id: 0,
  /** 分区名称 */
  name: '',
  /** 是否存在子分区 */
  hasChildren: false,
  /** 是否级联删除子分区 */
  cascade: false
})

/**
 * 将分区行转换为下拉选项，便于选择父分区。
 */
const partitionSelectOptions = computed(() => [
  { label: '无（顶级分区）', value: null },
  ...partitionRows.value.map(({ partition, depth }) => ({
    label: `${'　'.repeat(depth)}${partition.name}`,
    value: partition.id
  }))
])

/**
 * 构建分区 ID 与父分区 ID 的映射。
 */
const partitionParentMap = computed(() => {
  const map = new Map<number, number | null>()
  const stack: Array<{ id: number; depth: number }> = []

  partitionRows.value.forEach(({ partition, depth }) => {
    while (stack.length > 0 && stack[stack.length - 1]!.depth >= depth) {
      stack.pop()
    }

    const parent = stack.length > 0 ? stack[stack.length - 1] : null
    const parentId = parent ? parent.id : null
    map.set(partition.id, parentId)
    stack.push({ id: partition.id, depth })
  })

  return map
})

/** 当前正在编辑的分区的所有子孙节点 ID，用于防止选择为自己的子节点。 */
const editDescendantIds = ref<number[]>([])

/**
 * 根据当前编辑的分区过滤父分区选项，避免出现自引用或循环引用。
 */
const filteredEditParentOptions = computed(() =>
  partitionSelectOptions.value.filter((option) => {
    const value = option.value
    if (value === null) return true
    if (typeof value !== 'number') return true
    return value !== editForm.id && !editDescendantIds.value.includes(value)
  })
)

/**
 * 重置新建分区表单。
 * @param {number | null} parentId 父分区 ID
 */
function resetCreateForm(parentId: number | null = null) {
  createForm.name = ''
  createForm.visibility = 0
  createForm.parentId = parentId
}

/**
 * 收集指定分区的所有子孙 ID，后续用于阻止循环引用。
 * @param {Article.Partition} partition 需要遍历的分区节点。
 * @returns {number[]} 子孙节点 ID 数组。
 */
function collectDescendantIds(partition: Article.Partition): number[] {
  const result: number[] = []
  const stack = [...(partition.children ?? [])]
  while (stack.length) {
    const node = stack.pop()!
    result.push(node.id)
    if (node.children?.length) {
      stack.push(...node.children)
    }
  }
  return result
}

/**
 * 获取指定分区的父级 ID，若没有父级则返回 null。
 */
function getParentId(partitionId: number): number | null {
  return partitionParentMap.value.get(partitionId) ?? null
}

/**
 * 统一处理接口调用错误并提示。
 * @param {unknown} error 异常对象。
 * @param {string} fallback 默认提示语。
 */
function handleApiError(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    const apiError = error as ApiError
    toast.add({
      title: fallback,
      description: `${apiError.message} (${apiError.code})`,
      color: 'error'
    })
  } else {
    console.error(fallback, error)
    toast.add({
      title: fallback,
      description: '发生未知错误，请稍后重试',
      color: 'error'
    })
  }
}

/**
 * 提交新建分区请求。
 */
async function handleCreatePartition() {
  const trimmedName = createForm.name.trim()
  if (!trimmedName) {
    toast.add({ title: '分区名称不能为空', color: 'warning' })
    return
  }

  isCreating.value = true
  try {
    await createArticlePartition({
      name: trimmedName,
      visibility: createForm.visibility,
      parentId: createForm.parentId ?? undefined
    })
    toast.add({ title: '分区创建成功', color: 'success' })
    emit('closeCreateModal')
    emit('partitionCreated')
  } catch (error) {
    handleApiError(error, '创建分区失败')
  } finally {
    isCreating.value = false
  }
}

/**
 * 提交更新分区请求。
 */
async function handleUpdatePartition() {
  const trimmedName = editForm.name.trim()
  if (!trimmedName) {
    toast.add({ title: '分区名称不能为空', color: 'warning' })
    return
  }

  isUpdating.value = true
  try {
    await patchArticlePartition({
      id: editForm.id,
      name: trimmedName,
      visibility: editForm.visibility,
      order: Number.isFinite(editForm.order) ? editForm.order : undefined,
      parentId: editForm.parentId ?? undefined
    })
    toast.add({ title: '分区更新成功', color: 'success' })
    emit('closeEditModal')
    emit('partitionUpdated')
  } catch (error) {
    handleApiError(error, '更新分区失败')
  } finally {
    isUpdating.value = false
  }
}

/**
 * 删除指定分区。
 */
async function handleDeletePartition() {
  isDeleting.value = true
  try {
    if (deleteForm.cascade) {
      await deleteArticlePartitionCascade(deleteForm.id)
    } else {
      await deleteArticlePartition(deleteForm.id)
    }
    toast.add({ title: '分区删除成功', color: 'success' })
    emit('closeDeleteModal')
    emit('partitionDeleted')
  } catch (error) {
    handleApiError(error, '删除分区失败')
  } finally {
    isDeleting.value = false
  }
}

// 监听弹窗显示状态变化，初始化表单
watch(showCreateModal, (newVal) => {
  if (newVal) {
    resetCreateForm(createParentId.value)
  }
})

watch(editPartition, (newPartition) => {
  if (newPartition && showEditModal.value) {
    editForm.id = newPartition.id
    editForm.name = newPartition.name
    editForm.visibility = newPartition.visibility as 0 | 1
    editForm.order = newPartition.order
    editForm.parentId = getParentId(newPartition.id)
    editDescendantIds.value = collectDescendantIds(newPartition)
  }
})

watch(deletePartition, (newPartition) => {
  if (newPartition && showDeleteModal.value) {
    deleteForm.id = newPartition.id
    deleteForm.name = newPartition.name
    deleteForm.hasChildren = Boolean(newPartition.children?.length)
    deleteForm.cascade = false
  }
})
</script>

<template>
  <div>
    <UModal
      v-model:open="showCreateModal"
      title="新建分区"
      :description="
        createForm.parentId
          ? `在分区“${partitionRows.find((r) => r.partition.id === createForm.parentId)?.partition.name}”下创建子分区`
          : '填写分区基础信息，包括名称、可见性和父分区。'
      "
    >
      <template #body>
        <div class="space-y-4">
          <UFormField label="分区名称" name="name">
            <UInput v-model="createForm.name" placeholder="请输入分区名称" />
          </UFormField>
          <UFormField label="可见性" name="visibility">
            <URadioGroup
              v-model="createForm.visibility"
              :items="[
                { label: '公开', value: 0 },
                { label: '私密', value: 1 }
              ]"
            />
          </UFormField>
          <UFormField label="父分区" name="parentId">
            <USelect
              v-model="createForm.parentId"
              :items="partitionSelectOptions"
              option-attribute="label"
              value-attribute="value"
              placeholder="选择父分区"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="emit('closeCreateModal')">
            取消
          </UButton>
          <UButton color="primary" :loading="isCreating" @click="handleCreatePartition">
            保存
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="showEditModal"
      title="编辑分区"
      description="修改分区名称、可见性、排序值或父分区。"
    >
      <template #body>
        <div class="space-y-4">
          <UFormField label="分区名称" name="name">
            <UInput v-model="editForm.name" placeholder="请输入分区名称" />
          </UFormField>
          <UFormField label="可见性" name="visibility">
            <URadioGroup
              v-model="editForm.visibility"
              :options="[
                { label: '公开', value: 0 },
                { label: '私密', value: 1 }
              ]"
            />
          </UFormField>
          <UFormField label="排序值" name="order">
            <UInput v-model.number="editForm.order" type="number" min="0" />
          </UFormField>
          <UFormField label="父分区" name="parentId">
            <USelect
              v-model="editForm.parentId"
              :items="filteredEditParentOptions"
              option-attribute="label"
              value-attribute="value"
              placeholder="选择父分区"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="emit('closeEditModal')"> 取消 </UButton>
          <UButton color="primary" :loading="isUpdating" @click="handleUpdatePartition">
            保存
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="showDeleteModal"
      title="删除分区"
      description="删除分区前请确认是否需要级联删除子分区。"
    >
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            确认要删除分区 <span class="font-semibold">{{ deleteForm.name }}</span> 吗？
          </p>
          <p v-if="deleteForm.hasChildren" class="text-xs text-amber-600 dark:text-amber-300">
            该分区包含子分区，如需一并删除请勾选级联删除。
          </p>
          <UCheckbox
            v-if="deleteForm.hasChildren"
            v-model="deleteForm.cascade"
            label="级联删除子分区"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="emit('closeDeleteModal')">
            取消
          </UButton>
          <UButton color="error" :loading="isDeleting" @click="handleDeletePartition">
            删除
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
