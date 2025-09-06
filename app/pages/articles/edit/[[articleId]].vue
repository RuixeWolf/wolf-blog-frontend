<script lang="ts" setup>
import { createArticle, patchArticle } from '~/apis/article'
import { ARTICLE_VISIBILITY_OPTIONS } from '~~/shared/constants/article'
import { MdEditor } from 'md-editor-v3'
import { useDark } from '@vueuse/core'

/** Vue Route */
const route = useRoute()

/** 文章 ID */
const articleId = (route.params.articleId as string) || ''

/** 黑暗模式 */
const isDark = useDark()

/** 编辑器模式 */
const isEditing = computed(() => articleId && articleId !== 'new')

/** 表单状态 */
const formData = reactive({
  title: '',
  primary: '',
  content: '',
  partitionId: 1,
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
        tags: [...article.tags],
        comUseTags: [...article.comUseTags],
        visibility: article.visibility
      })
    }
  },
  { immediate: true }
)

/** 标签输入相关 */
const newTag = ref('')
function addTag() {
  if (newTag.value.trim() && !formData.tags.includes(newTag.value.trim())) {
    formData.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}
function removeTag(index: number) {
  formData.tags.splice(index, 1)
}

/** 常用标签输入相关 */
const newComUseTag = ref<number | ''>('')
function addComUseTag() {
  const tagId = Number(newComUseTag.value)
  if (tagId && !formData.comUseTags.includes(tagId)) {
    formData.comUseTags.push(tagId)
    newComUseTag.value = ''
  }
}
function removeComUseTag(index: number) {
  formData.comUseTags.splice(index, 1)
}

/** 保存文章 */
async function saveArticle() {
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
      const newArticle = await createArticle(formData)
      // 创建成功后跳转到文章详情页
      await navigateTo(`/articles/${newArticle.id}`)
      return
    }
    refreshArticle()
    // 编辑成功后跳转到文章详情页
    await navigateTo(`/articles/${articleId}`)
  } catch (error) {
    console.error('保存文章失败:', error)
    // 这里可以添加错误提示
  } finally {
    saving.value = false
  }
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
  <div class="container mx-auto py-8">
    <!-- 返回按钮和页面标题 -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" @click="goBack">
          返回
        </UButton>
        <h1 class="text-2xl font-bold">
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
    <div v-if="loadingArticle" class="space-y-6">
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-20 w-full" />
      <USkeleton class="h-96 w-full" />
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
    <div v-else class="space-y-6">
      <!-- 基本信息 -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">基本信息</h2>
        </template>

        <div class="space-y-6">
          <!-- 文章标题 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              文章标题 <span class="text-red-500">*</span>
            </label>
            <UInput v-model="formData.title" placeholder="请输入文章标题" size="lg" />
          </div>

          <!-- 文章摘要 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              文章摘要
            </label>
            <UTextarea v-model="formData.primary" placeholder="请输入文章摘要" :rows="3" />
          </div>

          <!-- 分区和可见性 -->
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                分区 ID
              </label>
              <UInput
                v-model.number="formData.partitionId"
                type="number"
                placeholder="分区 ID"
                :min="1"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                可见性
              </label>
              <USelect
                v-model="formData.visibility"
                :items="ARTICLE_VISIBILITY_OPTIONS"
                option-attribute="label"
                value-attribute="value"
              />
            </div>
          </div>
        </div>
      </UCard>

      <!-- 标签管理 -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">标签管理</h2>
        </template>

        <div class="space-y-6">
          <!-- 普通标签 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              标签
            </label>

            <!-- 标签输入 -->
            <div class="mb-3 flex gap-2">
              <UInput
                v-model="newTag"
                placeholder="添加标签"
                class="flex-1"
                @keyup.enter="addTag"
              />
              <UButton
                icon="i-lucide-plus"
                variant="outline"
                :disabled="!newTag.trim()"
                @click="addTag"
              >
                添加
              </UButton>
            </div>

            <!-- 标签列表 -->
            <div v-if="formData.tags.length > 0" class="flex flex-wrap gap-2">
              <UBadge
                v-for="(tag, index) in formData.tags"
                :key="index"
                variant="soft"
                color="primary"
                class="flex items-center gap-1"
              >
                {{ tag }}
                <UButton
                  icon="i-lucide-x"
                  size="xs"
                  variant="ghost"
                  color="primary"
                  @click="removeTag(index)"
                />
              </UBadge>
            </div>
          </div>

          <!-- 常用标签 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              常用标签 ID
            </label>

            <!-- 常用标签输入 -->
            <div class="mb-3 flex gap-2">
              <UInput
                v-model.number="newComUseTag"
                type="number"
                placeholder="添加常用标签 ID"
                class="flex-1"
                :min="1"
                @keyup.enter="addComUseTag"
              />
              <UButton
                icon="i-lucide-plus"
                variant="outline"
                :disabled="!newComUseTag"
                @click="addComUseTag"
              >
                添加
              </UButton>
            </div>

            <!-- 常用标签列表 -->
            <div v-if="formData.comUseTags.length > 0" class="flex flex-wrap gap-2">
              <UChip
                v-for="(tagId, index) in formData.comUseTags"
                :key="index"
                size="sm"
                color="neutral"
                class="flex items-center gap-1"
              >
                <UBadge variant="outline" color="secondary" size="xs"> #{{ tagId }} </UBadge>
                <UButton
                  icon="i-lucide-x"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  @click="removeComUseTag(index)"
                />
              </UChip>
            </div>
          </div>
        </div>
      </UCard>

      <!-- 文章内容 -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">文章内容 <span class="text-red-500">*</span></h2>
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
  </div>
</template>

<style scoped>
/* 自定义样式可以在这里添加 */
</style>
