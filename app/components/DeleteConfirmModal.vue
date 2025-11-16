<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  /** 是否显示模态框 */
  open: boolean
  /** 删除项目名称 */
  itemName: string
  /** 模态框标题 */
  title?: string
  /** 自定义确认消息 */
  message?: string
  /** 加载状态 */
  loading?: boolean
  /** 危险操作提示 */
  isDangerous?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '确认删除',
  message: '',
  loading: false,
  isDangerous: true
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const confirmMessage = computed(() => {
  if (props.message) {
    return props.message
  }
  return `确定要删除 "${props.itemName}" 吗？`
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}
</script>

<template>
  <UModal v-model:open="isOpen" :title="title">
    <template #body>
      <div class="space-y-4">
        <p class="text-gray-700 dark:text-gray-300">
          {{ confirmMessage }}
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-3">
        <UButton variant="outline" color="neutral" :disabled="loading" @click="handleCancel">
          取消
        </UButton>
        <UButton
          :color="isDangerous ? 'error' : 'primary'"
          :loading="loading"
          @click="handleConfirm"
        >
          确认删除
        </UButton>
      </div>
    </template>
  </UModal>
</template>
