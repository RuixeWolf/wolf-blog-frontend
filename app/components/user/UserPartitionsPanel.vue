<script setup lang="ts">
// 导入必要的 API 和工具
import { ApiError } from '~~/shared/types/ApiError'
import { patchArticlePartition } from '@/apis/article/partition'
import UserPartitionsEditor from './UserPartitionsEditor.vue'
import UserPartitionsList from './UserPartitionsList.vue'

interface PartitionRow {
  partition: Article.Partition
  depth: number
}

/**
 * 分区管理组件的传入属性定义。
 */
const props = defineProps<{
  /** 分区行数据，包含层级信息 */
  partitionRows: PartitionRow[]
  /** 分区加载状态 */
  partitionsPending: boolean
  /** 分区错误信息 */
  partitionsErrorMessage?: string | null
}>()

/**
 * 将传入属性解构为响应式引用，便于模板和逻辑复用。
 */
const { partitionRows, partitionsPending, partitionsErrorMessage } = toRefs(props)

/**
 * 组件对外暴露的事件定义。
 * - refresh: 请求父级重新拉取分区数据。
 */
const emit = defineEmits<{
  /** 请求刷新分区列表 */
  (event: 'refresh'): void
}>()

/** 新建、编辑、删除弹窗的显隐状态。 */
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

/** 创建子分区时的父分区 ID */
const createParentId = ref<number | null>(null)

/** 当前编辑和删除的分区 */
const editPartition = ref<Article.Partition | null>(null)
const deletePartition = ref<Article.Partition | null>(null)

/**
 * 发出刷新事件供父级重新拉取数据。
 */
function handleRefresh() {
  emit('refresh')
}

/**
 * 打开新建分区弹窗。
 * @param {number | null} parentId 父分区 ID，为 null 时创建顶级分区。
 */
function handleOpenCreateModal(parentId: number | null = null) {
  createParentId.value = parentId
  showCreateModal.value = true
}

/**
 * 打开编辑分区弹窗。
 * @param {Article.Partition} partition 当前待编辑分区。
 */
function handleOpenEditModal(partition: Article.Partition) {
  editPartition.value = partition
  showEditModal.value = true
}

/**
 * 打开删除分区确认弹窗。
 * @param {Article.Partition} partition 当前待删除分区。
 */
function handleOpenDeleteModal(partition: Article.Partition) {
  deletePartition.value = partition
  showDeleteModal.value = true
}

/**
 * 关闭新建弹窗。
 */
function handleCloseCreateModal() {
  showCreateModal.value = false
  createParentId.value = null
}

/**
 * 关闭编辑弹窗。
 */
function handleCloseEditModal() {
  showEditModal.value = false
  editPartition.value = null
}

/**
 * 关闭删除弹窗。
 */
function handleCloseDeleteModal() {
  showDeleteModal.value = false
  deletePartition.value = null
}

/**
 * 处理分区创建成功。
 */
function handlePartitionCreated() {
  handleRefresh()
}

/**
 * 处理分区更新成功。
 */
function handlePartitionUpdated() {
  handleRefresh()
}

/**
 * 处理分区删除成功。
 */
function handlePartitionDeleted() {
  handleRefresh()
}

/**
 * 向上移动分区排序。
 * @param {Article.Partition} partition 要移动的分区。
 */
async function handleMovePartitionUp(partition: Article.Partition) {
  // 逻辑移到列表组件，但这里需要实现
  // 实际上，列表组件 emits 事件，主组件处理
  // 但为了简单，主组件处理排序逻辑
  const currentIndex = partitionRows.value.findIndex((row) => row.partition.id === partition.id)
  if (currentIndex <= 0) return

  const prevRow = partitionRows.value[currentIndex - 1]
  if (!prevRow) return
  const prevPartition = prevRow.partition
  // 交换 order
  const tempOrder = partition.order
  try {
    await patchArticlePartition({ id: partition.id, order: prevPartition.order })
    await patchArticlePartition({ id: prevPartition.id, order: tempOrder })
    toast.add({ title: '分区排序更新成功', color: 'success' })
    emit('refresh')
  } catch (error) {
    handleApiError(error, '更新分区排序失败')
  }
}

/**
 * 向下移动分区排序。
 * @param {Article.Partition} partition 要移动的分区。
 */
async function handleMovePartitionDown(partition: Article.Partition) {
  const currentIndex = partitionRows.value.findIndex((row) => row.partition.id === partition.id)
  if (currentIndex >= partitionRows.value.length - 1) return

  const nextRow = partitionRows.value[currentIndex + 1]
  if (!nextRow) return
  const nextPartition = nextRow.partition
  // 交换 order
  const tempOrder = partition.order
  try {
    await patchArticlePartition({ id: partition.id, order: nextPartition.order })
    await patchArticlePartition({ id: nextPartition.id, order: tempOrder })
    toast.add({ title: '分区排序更新成功', color: 'success' })
    emit('refresh')
  } catch (error) {
    handleApiError(error, '更新分区排序失败')
  }
}

const toast = useToast()

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
</script>

<template>
  <section id="user-partitions">
    <UserPartitionsList
      :partition-rows="partitionRows"
      :partitions-pending="partitionsPending"
      :partitions-error-message="partitionsErrorMessage"
      @refresh="handleRefresh"
      @open-create-modal="handleOpenCreateModal"
      @open-edit-modal="handleOpenEditModal"
      @open-delete-modal="handleOpenDeleteModal"
      @move-partition-up="handleMovePartitionUp"
      @move-partition-down="handleMovePartitionDown"
    />

    <UserPartitionsEditor
      :partition-rows="partitionRows"
      :show-create-modal="showCreateModal"
      :show-edit-modal="showEditModal"
      :show-delete-modal="showDeleteModal"
      :create-parent-id="createParentId"
      :edit-partition="editPartition"
      :delete-partition="deletePartition"
      @close-create-modal="handleCloseCreateModal"
      @close-edit-modal="handleCloseEditModal"
      @close-delete-modal="handleCloseDeleteModal"
      @partition-created="handlePartitionCreated"
      @partition-updated="handlePartitionUpdated"
      @partition-deleted="handlePartitionDeleted"
    />
  </section>
</template>
