<script setup lang="ts">
import {
  createFavoriteFolder,
  deleteFavoriteFolder,
  getFavoriteArticles,
  getUserFavorites,
  patchFavoriteFolder
} from '@/apis/favorite'

const props = defineProps<{
  userId: number
}>()

const toast = useToast()

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const favorites = ref<Favorite.FavoriteFolderList>([])

const showCreateModal = ref(false)
const showEditModal = ref(false)

/**
 * 新建收藏夹表单状态。
 */
const createForm = reactive({
  title: '',
  visibility: 0 as 0 | 1,
  isDefault: false
})

/**
 * 编辑收藏夹表单状态。
 */
const editForm = reactive({
  id: 0,
  title: '',
  visibility: 0 as 0 | 1,
  isDefault: false
})

/**
 * 原始编辑表单数据，用于对比变化。
 */
const originalEditForm = reactive({
  id: 0,
  title: '',
  visibility: 0 as 0 | 1,
  isDefault: false
})

const expandedFavorites = ref<number[]>([])

interface FavoriteArticlesState {
  loading: boolean
  error: string | null
  data: Favorite.FavoriteArticlePage | null
  pageNumber: number
  pageSize: number
}

/**
 * 每个收藏夹的文章分页状态缓存。
 */
const favoriteArticlesState = reactive<Partial<Record<number, FavoriteArticlesState>>>({})

/**
 * 重置创建表单字段。
 */
function resetCreateForm() {
  createForm.title = ''
  createForm.visibility = 0
  createForm.isDefault = false
}

/**
 * 重置编辑表单字段。
 */
function resetEditForm() {
  editForm.id = 0
  editForm.title = ''
  editForm.visibility = 0
  editForm.isDefault = false
  originalEditForm.id = 0
  originalEditForm.title = ''
  originalEditForm.visibility = 0
  originalEditForm.isDefault = false
}

/**
 * 获取用户收藏夹列表。
 */
async function fetchFavorites() {
  isLoading.value = true
  errorMessage.value = null
  try {
    favorites.value = await getUserFavorites(props.userId)
  } catch (error) {
    console.error('获取收藏夹失败', error)
    errorMessage.value = error instanceof ApiError ? error.message : '获取收藏夹失败，请稍后再试'
  } finally {
    isLoading.value = false
  }
}

/**
 * 初始化并返回指定收藏夹的文章状态。
 * @param {number} favoriteId 收藏夹 ID。
 */
function ensureFavoriteState(favoriteId: number) {
  if (!favoriteArticlesState[favoriteId]) {
    favoriteArticlesState[favoriteId] = {
      loading: false,
      error: null,
      data: null,
      pageNumber: 1,
      pageSize: 10
    }
  }
  return favoriteArticlesState[favoriteId] as FavoriteArticlesState
}

function getFavoriteState(favoriteId: number) {
  return ensureFavoriteState(favoriteId)
}

/**
 * 判断收藏夹是否存在多页数据。
 */
function favoriteHasMorePages(favoriteId: number): boolean {
  const state = favoriteArticlesState[favoriteId]
  if (!state?.data) return false
  return (state.data.totalPage ?? 1) > 1
}

/**
 * 返回收藏夹文章总页数。
 */
function favoritePageCount(favoriteId: number): number {
  return favoriteArticlesState[favoriteId]?.data?.totalPage ?? 1
}

/**
 * 返回收藏夹内文章总数。
 */
function favoriteTotalRows(favoriteId: number): number {
  return favoriteArticlesState[favoriteId]?.data?.totalRow ?? 0
}

/**
 * 加载收藏夹下的分页文章列表。
 * @param {number} favoriteId 收藏夹 ID。
 * @param {number} [pageNumber] 指定页码。
 */
async function loadFavoriteArticles(favoriteId: number, pageNumber?: number) {
  const state = ensureFavoriteState(favoriteId)
  if (pageNumber) state.pageNumber = pageNumber
  state.loading = true
  state.error = null
  try {
    state.data = await getFavoriteArticles({
      favoritesId: favoriteId,
      pageNumber: state.pageNumber,
      pageSize: state.pageSize
    })
  } catch (error) {
    console.error('获取收藏夹文章失败', error)
    state.error = error instanceof ApiError ? error.message : '加载收藏文章失败'
  } finally {
    state.loading = false
  }
}

watch(expandedFavorites, (openIds) => {
  openIds.forEach((favoriteId) => {
    const state = ensureFavoriteState(favoriteId)
    if (!state.data && !state.loading) {
      void loadFavoriteArticles(favoriteId)
    }
  })
})

/**
 * 打开新建收藏夹弹窗。
 */
function openCreateModal() {
  resetCreateForm()
  showCreateModal.value = true
}

/**
 * 打开编辑收藏夹弹窗。
 * @param {Favorite.FavoriteFolder} favorite 当前收藏夹。
 */
function openEditModal(favorite: Favorite.FavoriteFolder) {
  editForm.id = favorite.id
  editForm.title = favorite.title
  editForm.visibility = favorite.visibility as 0 | 1
  editForm.isDefault = favorite.isDefault === 1
  // 保存原始值用于对比
  originalEditForm.id = favorite.id
  originalEditForm.title = favorite.title
  originalEditForm.visibility = favorite.visibility as 0 | 1
  originalEditForm.isDefault = favorite.isDefault === 1
  showEditModal.value = true
}

/**
 * 提交新建收藏夹请求。
 */
async function handleCreateFavorite() {
  if (!createForm.title.trim()) {
    toast.add({ title: '收藏夹名称不能为空', color: 'warning' })
    return
  }
  try {
    favorites.value = await createFavoriteFolder({
      title: createForm.title.trim(),
      visibility: createForm.visibility,
      isDefault: createForm.isDefault ? 1 : 0
    })
    toast.add({ title: '收藏夹创建成功', color: 'success' })
    showCreateModal.value = false
    resetCreateForm()
  } catch (error) {
    console.error('创建收藏夹失败', error)
    toast.add({
      title: '创建收藏夹失败',
      description: error instanceof ApiError ? error.message : '请稍后再试',
      color: 'error'
    })
  }
}

/**
 * 提交收藏夹编辑请求。
 */
async function handleEditFavorite() {
  if (!editForm.title.trim()) {
    toast.add({ title: '收藏夹名称不能为空', color: 'warning' })
    return
  }

  // 对比变化，只发送修改过的字段
  const trimmedTitle = editForm.title.trim()
  const hasChanges =
    trimmedTitle !== originalEditForm.title ||
    editForm.visibility !== originalEditForm.visibility ||
    editForm.isDefault !== originalEditForm.isDefault

  if (!hasChanges) {
    toast.add({ title: '没有修改任何内容', color: 'neutral' })
    showEditModal.value = false
    return
  }

  try {
    const updated = await patchFavoriteFolder({
      id: editForm.id,
      title: trimmedTitle !== originalEditForm.title ? trimmedTitle : undefined,
      visibility:
        editForm.visibility !== originalEditForm.visibility ? editForm.visibility : undefined,
      isDefault:
        editForm.isDefault !== originalEditForm.isDefault ? (editForm.isDefault ? 1 : 0) : undefined
    })
    favorites.value = favorites.value.map((fav) => (fav.id === updated.id ? updated : fav))
    toast.add({ title: '收藏夹更新成功', color: 'success' })
    showEditModal.value = false
    resetEditForm()
  } catch (error) {
    console.error('更新收藏夹失败', error)
    toast.add({
      title: '更新收藏夹失败',
      description: error instanceof ApiError ? error.message : '请稍后再试',
      color: 'error'
    })
  }
}

/**
 * 删除收藏夹并刷新列表。
 * @param {number} favoriteId 收藏夹 ID。
 */
async function handleDeleteFavorite(favoriteId: number) {
  try {
    favorites.value = await deleteFavoriteFolder(favoriteId)
    favoriteArticlesState[favoriteId] = undefined
    expandedFavorites.value = expandedFavorites.value.filter((id) => id !== favoriteId)
    toast.add({ title: '收藏夹已删除', color: 'success' })
  } catch (error) {
    console.error('删除收藏夹失败', error)
    toast.add({
      title: '删除收藏夹失败',
      description: error instanceof ApiError ? error.message : '请稍后再试',
      color: 'error'
    })
  }
}

/**
 * 展开或收起收藏夹内容。
 */
function handleToggleFavorite(favoriteId: number) {
  if (expandedFavorites.value.includes(favoriteId)) {
    expandedFavorites.value = expandedFavorites.value.filter((id) => id !== favoriteId)
  } else {
    expandedFavorites.value = [...expandedFavorites.value, favoriteId]
  }
}

/**
 * 处理分页切换。
 */
function handlePageChange(favoriteId: number, page: number) {
  void loadFavoriteArticles(favoriteId, page)
}

onMounted(() => {
  void fetchFavorites()
})
</script>

<template>
  <section id="user-favorites" class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h3 class="text-lg font-semibold">我的收藏夹</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">管理你的收藏夹并查看收藏的文章</p>
      </div>
      <UButton icon="i-lucide-plus" color="primary" @click="openCreateModal">新建收藏夹</UButton>
    </div>

    <div v-if="isLoading" class="space-y-3">
      <USkeleton v-for="index in 3" :key="index" class="h-20 w-full" />
    </div>

    <div
      v-else-if="errorMessage"
      class="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/70 dark:bg-amber-500/10"
    >
      <p class="text-sm text-amber-700 dark:text-amber-200">{{ errorMessage }}</p>
    </div>

    <div v-else>
      <UAlert v-if="!favorites.length" variant="subtle" icon="i-lucide-info" color="neutral">
        你还没有创建任何收藏夹。
      </UAlert>

      <div v-else class="space-y-4">
        <UCard
          v-for="favorite in favorites"
          :key="favorite.id"
          class="border border-gray-100 dark:border-gray-800"
        >
          <template #header>
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-base font-semibold">{{ favorite.title }}</h4>
                  <UBadge
                    :color="favorite.visibility === 0 ? 'primary' : 'neutral'"
                    variant="subtle"
                  >
                    {{ favorite.visibility === 0 ? '公开' : '私密' }}
                  </UBadge>
                  <UBadge v-if="favorite.isDefault === 1" color="warning" variant="subtle">
                    默认
                  </UBadge>
                </div>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  收藏夹 ID：{{ favorite.id }}
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-pencil"
                  @click="openEditModal(favorite)"
                >
                  编辑
                </UButton>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="error"
                  icon="i-lucide-trash-2"
                  @click="handleDeleteFavorite(favorite.id)"
                >
                  删除
                </UButton>
                <UButton
                  size="xs"
                  variant="ghost"
                  :icon="
                    expandedFavorites.includes(favorite.id)
                      ? 'i-lucide-chevron-up'
                      : 'i-lucide-chevron-down'
                  "
                  @click="handleToggleFavorite(favorite.id)"
                >
                  {{ expandedFavorites.includes(favorite.id) ? '收起' : '查看收藏' }}
                </UButton>
              </div>
            </div>
          </template>

          <template v-if="expandedFavorites.includes(favorite.id)" #default>
            <div class="space-y-3">
              <div v-if="favoriteArticlesState[favorite.id]?.loading" class="space-y-2">
                <USkeleton v-for="index in 3" :key="index" class="h-16 w-full" />
              </div>
              <UAlert
                v-else-if="favoriteArticlesState[favorite.id]?.error"
                variant="subtle"
                color="error"
                icon="i-lucide-alert-circle"
              >
                {{ favoriteArticlesState[favorite.id]?.error }}
              </UAlert>
              <div v-else>
                <div
                  v-if="favoriteArticlesState[favorite.id]?.data?.records?.length"
                  class="space-y-3"
                >
                  <div
                    v-for="article in favoriteArticlesState[favorite.id]?.data?.records ?? []"
                    :key="article.id"
                    class="hover:border-primary-200 hover:bg-primary-50/50 dark:hover:border-primary-400/60 dark:hover:bg-primary-500/10 rounded-lg border border-gray-100 p-3 transition dark:border-gray-800"
                  >
                    <NuxtLink :to="`/articles/${article.id}`" class="text-sm font-medium">
                      {{ article.title }}
                    </NuxtLink>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {{ article.postTime }} · 浏览 {{ article.views }}
                    </p>
                    <p class="mt-2 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                      {{ 'primary' in article && article.primary ? article.primary : '暂无摘要' }}
                    </p>
                  </div>
                </div>
                <UAlert v-else variant="subtle" icon="i-lucide-info" color="neutral">
                  该收藏夹暂无文章
                </UAlert>
              </div>

              <div v-if="favoriteHasMorePages(favorite.id)" class="flex justify-center">
                <UPagination
                  v-model="getFavoriteState(favorite.id).pageNumber"
                  :page-count="favoritePageCount(favorite.id)"
                  :total="favoriteTotalRows(favorite.id)"
                  :page-size="getFavoriteState(favorite.id).pageSize"
                  @update:model-value="(page: number) => handlePageChange(favorite.id, page)"
                />
              </div>
            </div>
          </template>
        </UCard>
      </div>
    </div>

    <UModal v-model:open="showCreateModal" title="新建收藏夹">
      <template #body>
        <div class="space-y-4">
          <UFormField label="收藏夹名称" name="title">
            <UInput v-model="createForm.title" placeholder="请输入收藏夹名称" />
          </UFormField>
          <UFormField label="可见性" name="visibility">
            <URadioGroup
              v-model="createForm.visibility"
              :options="[
                { label: '公开', value: 0 },
                { label: '私密', value: 1 }
              ]"
            />
          </UFormField>
          <UCheckbox v-model="createForm.isDefault" label="设置为默认收藏夹" />
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="showCreateModal = false">取消</UButton>
          <UButton color="primary" @click="handleCreateFavorite">保存</UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="showEditModal" title="编辑收藏夹">
      <template #body>
        <div class="space-y-4">
          <UFormField label="收藏夹名称" name="title">
            <UInput v-model="editForm.title" placeholder="请输入收藏夹名称" />
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
          <UCheckbox v-model="editForm.isDefault" label="设置为默认收藏夹" />
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="showEditModal = false">取消</UButton>
          <UButton color="primary" @click="handleEditFavorite">保存</UButton>
        </div>
      </template>
    </UModal>
  </section>
</template>
