<script setup lang="ts">
import { toRefs } from 'vue'

interface PartitionRow {
  partition: Article.Partition
  depth: number
}

/**
 * 分区列表组件的传入属性定义。
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
 */
const emit = defineEmits<{
  refresh: []
  openCreateModal: [parentId: number | null]
  openEditModal: [partition: Article.Partition]
  openDeleteModal: [partition: Article.Partition]
  movePartitionUp: [partition: Article.Partition]
  movePartitionDown: [partition: Article.Partition]
}>()

/**
 * 发出刷新事件供父级重新拉取数据。
 */
function handleRefresh() {
  emit('refresh')
}

/**
 * 打开新建分区弹窗。
 * @param {number|null} parentId 作为父级的分区 ID，顶级传 null。
 */
function handleOpenCreateModal(parentId: number | null = null) {
  emit('openCreateModal', parentId)
}

/**
 * 打开编辑分区弹窗。
 * @param {Article.Partition} partition 当前待编辑分区。
 */
function handleOpenEditModal(partition: Article.Partition) {
  emit('openEditModal', partition)
}

/**
 * 打开删除分区确认弹窗。
 * @param {Article.Partition} partition 当前待删除分区。
 */
function handleOpenDeleteModal(partition: Article.Partition) {
  emit('openDeleteModal', partition)
}

/**
 * 向上移动分区排序。
 * @param {Article.Partition} partition 要移动的分区。
 */
function handleMovePartitionUp(partition: Article.Partition) {
  emit('movePartitionUp', partition)
}

/**
 * 向下移动分区排序。
 * @param {Article.Partition} partition 要移动的分区。
 */
function handleMovePartitionDown(partition: Article.Partition) {
  emit('movePartitionDown', partition)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg font-semibold">分区管理</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">查看并管理你的文章分区</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <UButton
          icon="i-lucide-plus"
          color="primary"
          :disabled="partitionsPending"
          @click="handleOpenCreateModal(null)"
        >
          新建分区
        </UButton>
        <UButton
          icon="i-lucide-refresh-cw"
          variant="ghost"
          color="neutral"
          :loading="partitionsPending"
          @click="handleRefresh"
        >
          刷新分区
        </UButton>
      </div>
    </div>

    <div v-if="partitionsPending" class="space-y-2">
      <USkeleton v-for="index in 4" :key="index" class="h-10 w-full" />
    </div>

    <UAlert
      v-else-if="partitionsErrorMessage"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-circle"
    >
      {{ partitionsErrorMessage }}
    </UAlert>

    <UAlert v-else-if="!partitionRows.length" color="neutral" variant="subtle" icon="i-lucide-info">
      暂无分区，前往文章编辑页面可以创建新的文章分区。
    </UAlert>

    <div v-else class="overflow-hidden rounded-lg border border-gray-100 dark:border-gray-800">
      <div
        class="hidden bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 uppercase sm:grid sm:grid-cols-12 dark:bg-gray-900/60 dark:text-gray-400"
      >
        <span class="sm:col-span-5">分区名称</span>
        <span class="text-center sm:col-span-2">可见性</span>
        <span class="text-center sm:col-span-2">排序值</span>
        <span class="text-right sm:col-span-1">子分区数</span>
        <span class="text-right sm:col-span-2">操作</span>
      </div>

      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        <div
          v-for="{ partition, depth } in partitionRows"
          :key="partition.id"
          class="grid gap-2 px-4 py-3 text-sm sm:grid-cols-12 sm:items-center"
        >
          <div class="sm:col-span-5">
            <div class="flex items-center gap-2" :style="{ paddingLeft: `${depth * 1.25}rem` }">
              <div class="bg-primary-400 h-2 w-2 rounded-full" />
              <span class="font-medium text-gray-900 dark:text-gray-100">
                {{ partition.name }}
              </span>
            </div>
          </div>
          <div class="text-center sm:col-span-2">
            <UBadge :color="partition.visibility === 0 ? 'primary' : 'neutral'" variant="subtle">
              {{ partition.visibility === 0 ? '公开' : '私密' }}
            </UBadge>
          </div>
          <div class="text-center text-xs text-gray-500 sm:col-span-2 dark:text-gray-400">
            {{ partition.order }}
          </div>
          <div class="text-right text-xs text-gray-500 sm:col-span-1 dark:text-gray-400">
            {{ partition.children?.length ?? 0 }} 个
          </div>
          <div class="flex flex-wrap justify-end gap-2 sm:col-span-2">
            <UButton
              size="xs"
              variant="ghost"
              color="neutral"
              :disabled="partitionsPending"
              @click="handleMovePartitionUp(partition)"
            >
              <UIcon name="i-lucide-chevron-up" />
            </UButton>
            <UButton
              size="xs"
              variant="ghost"
              color="neutral"
              :disabled="partitionsPending"
              @click="handleMovePartitionDown(partition)"
            >
              <UIcon name="i-lucide-chevron-down" />
            </UButton>
            <UButton
              size="xs"
              variant="ghost"
              color="neutral"
              :disabled="partitionsPending"
              @click="handleOpenCreateModal(partition.id)"
            >
              新建子分区
            </UButton>
            <UButton
              size="xs"
              variant="ghost"
              color="primary"
              :disabled="partitionsPending"
              @click="handleOpenEditModal(partition)"
            >
              编辑
            </UButton>
            <UButton
              size="xs"
              variant="ghost"
              color="error"
              :disabled="partitionsPending"
              @click="handleOpenDeleteModal(partition)"
            >
              删除
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
