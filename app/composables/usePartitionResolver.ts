import { getArticlePartitions } from '@/apis/article/partition'

/**
 * 用于解析分区 ID 到分区名称路径的 composable。
 */
export function usePartitionResolver() {
  const partitions = ref<Article.Partition[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 获取分区列表。
   */
  async function fetchPartitions() {
    if (partitions.value.length > 0) return // 已加载，跳过

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

  /**
   * 在分区树中递归查找指定 ID 的分区。
   */
  function findPartition(
    partitionList: Article.Partition[],
    targetId: number
  ): Article.Partition | null {
    for (const partition of partitionList) {
      if (partition.id === targetId) {
        return partition
      }
      if (partition.children?.length) {
        const found = findPartition(partition.children, targetId)
        if (found) return found
      }
    }
    return null
  }

  /**
   * 获取从根分区到目标分区的完整路径。
   */
  function getPartitionPath(targetId: number): string[] {
    const path: string[] = []
    const visited = new Set<number>()

    function buildPath(partitionList: Article.Partition[], targetId: number): boolean {
      for (const partition of partitionList) {
        if (visited.has(partition.id)) continue
        visited.add(partition.id)

        if (partition.id === targetId) {
          path.push(partition.name)
          return true
        }

        if (partition.children?.length) {
          if (buildPath(partition.children, targetId)) {
            path.unshift(partition.name)
            return true
          }
        }
      }
      return false
    }

    buildPath(partitions.value, targetId)
    return path
  }

  /**
   * 根据分区 ID 解析为分区名称（含路径）。
   */
  const resolvePartitionName = (partitionId?: number | null): string => {
    if (!partitionId) return '无分区'
    const path = getPartitionPath(partitionId)
    return path.length > 0 ? path.join(' / ') : `分区 ${partitionId}`
  }

  /**
   * 根据分区 ID 解析为分区对象。
   */
  const resolvePartition = (partitionId?: number | null): Article.Partition | null => {
    if (!partitionId) return null
    return findPartition(partitions.value, partitionId)
  }

  return {
    partitions: readonly(partitions),
    loading: readonly(loading),
    error: readonly(error),
    fetchPartitions,
    resolvePartitionName,
    resolvePartition,
    getPartitionPath
  }
}
