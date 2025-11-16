<script lang="ts" setup>
import { createFavoriteFolder } from '@/apis/favorite'

interface Props {
  /** 文章 ID */
  articleId: number
}

const props = defineProps<Props>()

const modelValue = defineModel<boolean>('open', { required: true })

const toast = useToast()

/** 创建收藏夹模式 */
const isCreateFolderMode = ref(false)
const newFolderTitle = ref('')
const creatingFolder = ref(false)

const {
  userFolders,
  loading: favoriteLoading,
  mutationLoading: favoriteMutationLoading,
  isInFolder,
  toggleFavorite,
  refreshUserFolders
} = useArticleFavorite(toRef(props, 'articleId'))

/** 切换收藏夹中的文章 */
async function handleToggleFavoriteFolder(folderId: number) {
  if (favoriteMutationLoading.value) return

  try {
    await toggleFavorite(folderId)
  } catch (error) {
    console.error('更新收藏状态失败', error)
    toast.add({
      title: '操作失败',
      description: '请稍后再试',
      color: 'error'
    })
  }
}

/** 创建新收藏夹 */
async function handleCreateFolder() {
  if (!newFolderTitle.value.trim()) {
    toast.add({
      title: '请输入收藏夹名称',
      color: 'warning'
    })
    return
  }

  creatingFolder.value = true
  try {
    await createFavoriteFolder({
      title: newFolderTitle.value.trim()
    })

    toast.add({
      title: '创建成功',
      color: 'success'
    })

    newFolderTitle.value = ''
    isCreateFolderMode.value = false

    // 刷新收藏夹列表
    await refreshUserFolders()
  } catch (error) {
    console.error('创建收藏夹失败', error)
    toast.add({
      title: '创建失败',
      description: '请稍后再试',
      color: 'error'
    })
  } finally {
    creatingFolder.value = false
  }
}

/** 关闭弹窗时重置状态 */
watch(modelValue, (isOpen) => {
  if (!isOpen) {
    isCreateFolderMode.value = false
    newFolderTitle.value = ''
  }
})
</script>

<template>
  <UModal v-model:open="modelValue" title="选择收藏夹" :ui="{ footer: 'justify-between' }">
    <template #body>
      <div v-if="favoriteLoading" class="space-y-3">
        <USkeleton v-for="i in 3" :key="i" class="h-12 w-full" />
      </div>

      <div v-else-if="userFolders.length === 0" class="py-8 text-center">
        <UIcon name="i-lucide-folder-x" class="mx-auto mb-3 h-12 w-12 text-gray-400" />
        <p class="mb-4 text-gray-500">还没有收藏夹</p>
        <UButton icon="i-lucide-folder-plus" color="primary" @click="isCreateFolderMode = true">
          创建收藏夹
        </UButton>
      </div>

      <div v-else class="space-y-2">
        <!-- 创建新收藏夹模式 -->
        <div v-if="isCreateFolderMode" class="border-primary/50 bg-primary/5 rounded-lg border p-3">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">新建收藏夹</span>
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              size="xs"
              @click="
                () => {
                  isCreateFolderMode = false
                  newFolderTitle = ''
                }
              "
            />
          </div>
          <div class="flex gap-2">
            <UInput
              v-model="newFolderTitle"
              placeholder="输入收藏夹名称"
              class="flex-1"
              :disabled="creatingFolder"
              @keydown.enter="handleCreateFolder"
            />
            <UButton
              icon="i-lucide-check"
              color="primary"
              :loading="creatingFolder"
              @click="handleCreateFolder"
            >
              创建
            </UButton>
          </div>
        </div>

        <!-- 收藏夹列表 -->
        <div class="max-h-96 space-y-2 overflow-y-auto">
          <div
            v-for="folder in userFolders"
            :key="folder.id"
            class="group hover:border-primary/50 dark:hover:border-primary/50 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
          >
            <UCheckbox
              :model-value="isInFolder(folder.id)"
              :disabled="favoriteMutationLoading"
              @update:model-value="() => handleToggleFavoriteFolder(folder.id)"
            >
              <template #label>
                <div class="flex flex-1 items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon
                      :name="
                        folder.isDefault === 1
                          ? 'i-lucide-star'
                          : folder.visibility === 0
                            ? 'i-lucide-folder-open'
                            : 'i-lucide-folder-lock'
                      "
                      class="h-4 w-4"
                      :class="{
                        'text-yellow-500': folder.isDefault === 1,
                        'text-gray-500': folder.isDefault !== 1
                      }"
                    />
                    <span class="font-medium">{{ folder.title }}</span>
                    <UBadge
                      v-if="folder.isDefault === 1"
                      color="primary"
                      variant="subtle"
                      size="xs"
                    >
                      默认
                    </UBadge>
                    <UBadge
                      v-if="folder.visibility === 1"
                      color="neutral"
                      variant="subtle"
                      size="xs"
                    >
                      私密
                    </UBadge>
                  </div>
                </div>
              </template>
            </UCheckbox>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full items-center justify-between">
        <UButton
          v-if="!isCreateFolderMode && userFolders.length > 0"
          icon="i-lucide-folder-plus"
          variant="outline"
          color="neutral"
          @click="isCreateFolderMode = true"
        >
          新建收藏夹
        </UButton>
        <div v-else />

        <UButton color="neutral" @click="modelValue = false">完成</UButton>
      </div>
    </template>
  </UModal>
</template>
