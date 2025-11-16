<script setup lang="ts">
import { getArticlePartitions } from '@/apis/article/partition'

const props = defineProps<{
  modelValue?: number | null
  placeholder?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

interface PartitionOption {
  label: string
  value: number | null
  depth: number
}

const partitions = ref<Article.Partition[]>([])
const loading = ref(false)
const error = ref<Error | null>(null)

/**
 * 将分区树结构扁平化为选项列表，添加层级缩进。
 */
function flattenPartitions(
  partitionList: Article.Partition[],
  depth: number = 0
): PartitionOption[] {
  const result: PartitionOption[] = []
  for (const partition of partitionList) {
    result.push({
      label: `${'　'.repeat(depth)}${partition.name}`,
      value: partition.id,
      depth
    })
    if (partition.children?.length) {
      result.push(...flattenPartitions(partition.children, depth + 1))
    }
  }
  return result
}

const partitionOptions = computed<PartitionOption[]>(() => {
  const options: PartitionOption[] = [{ label: '无分区', value: null, depth: 0 }]
  if (partitions.value.length) {
    options.push(...flattenPartitions(partitions.value))
  }
  return options
})

const selectedValue = computed({
  get: () => props.modelValue ?? null,
  set: (value) => emit('update:modelValue', value)
})

/**
 * 获取分区列表。
 */
async function fetchPartitions() {
  loading.value = true
  error.value = null
  try {
    partitions.value = await getArticlePartitions()
  } catch (err) {
    console.error('获取分区列表失败', err)
    error.value = err instanceof Error ? err : new Error('获取分区失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void fetchPartitions()
})
</script>

<template>
  <div>
    <USelect
      v-model="selectedValue"
      :items="partitionOptions"
      option-attribute="label"
      value-attribute="value"
      :placeholder="placeholder ?? '选择分区'"
      :size="size ?? 'sm'"
      :loading="loading"
      :disabled="loading || !!error"
    />
    <p v-if="error" class="mt-1 text-xs text-red-500">
      {{ error.message }}
    </p>
  </div>
</template>
