<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import {
  createArticleComment,
  deleteArticleComment,
  getArticleComments
} from '@/apis/article/comment'
import { getUsersBriefByIds } from '@/apis/user'

/**
 * 文章评论组件的属性定义
 * @property {number} articleId 当前文章的唯一标识
 * @property {number} articleAuthorId 文章作者的用户 ID，用于权限判断
 * @property {string} loginRedirectPath 登录后需要跳转回的路由地址
 */
const props = defineProps<{
  /** 文章 ID */
  articleId: number
  /** 文章作者用户 ID */
  articleAuthorId: number
  /** 登录后重定向路径 */
  loginRedirectPath: string
}>()

/**
 * 组件向父级发送的事件
 * @event update:count 当评论总数发生变化时触发
 */
const emit = defineEmits<{
  (e: 'update:count', count: number): void
}>()

const toast = useToast()
const currentUser = useCurrentUser()
const { isLoggedIn, userInfo } = storeToRefs(currentUser)

const commentSectionEl = ref<HTMLElement | null>(null)
const commentContent = ref('')
const isSubmittingComment = ref(false)
const deletingCommentId = ref<number | null>(null)

/** 评论用户数据映射（userId -> UserBrief） */
const commentUsers = ref<Map<number, User.UserBrief>>(new Map())
const loadingUsers = ref(false)

/** 删除评论确认弹窗 */
const isDeleteCommentModalOpen = ref(false)
const commentToDelete = ref<Article.Comment | null>(null)

/**
 * 文章评论列表的异步数据状态
 * 使用 `useAsyncData` 根据文章 ID 获取评论分页数据
 */
const {
  data: commentList,
  pending: commentsPending,
  error: commentsError,
  refresh: refreshComments
} = useAsyncData<ApiPageData<Article.Comment>>(
  () => `article-comments-${props.articleId}`,
  () => getArticleComments({ articleId: props.articleId }),
  { watch: [() => props.articleId] }
)

/**
 * 评论分页数据，便于读取 `records` 和分页元信息
 */
const commentPagination = computed<ApiPageData<Article.Comment> | null>(
  () => commentList.value ?? null
)
/**
 * 当前展示的评论列表
 */
const comments = computed<Article.CommentList>(() => commentPagination.value?.records ?? [])
/**
 * 评论总数，优先使用接口返回的总行数，兼容无分页字段的情况
 */
const commentCount = computed(() => commentPagination.value?.totalRow ?? comments.value.length)
/**
 * 评论接口的错误消息
 */
const commentsErrorMessage = computed(() => commentsError.value?.message ?? '')

watch(
  commentCount,
  (count) => {
    emit('update:count', count)
  },
  { immediate: true }
)

/**
 * 当前登录用户是否为文章作者
 */
const isArticleAuthor = computed(() => userInfo.value?.id === props.articleAuthorId)

/**
 * 跳转到登录页面，同时携带登录后返回的地址
 */
function redirectToLogin() {
  navigateTo(props.loginRedirectPath)
}

/**
 * 判断当前用户是否拥有管理（删除）评论的权限
 * @param {Article.Comment} comment 目标评论对象
 * @returns {boolean} 是否允许管理该评论
 */
function canManageComment(comment: Article.Comment): boolean {
  if (!userInfo.value) return false
  if (userInfo.value.id === comment.userId) return true
  return isArticleAuthor.value
}

/**
 * 平滑滚动到评论区域
 */
function scrollToComments() {
  if (!import.meta.client) return
  if (commentSectionEl.value) {
    commentSectionEl.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

defineExpose({ scrollToComments })

/**
 * 当前评论内容是否满足基本校验
 */
const isCommentValid = computed(() => commentContent.value.trim().length > 0)

/**
 * 重新加载评论列表
 */
function reloadComments() {
  void refreshComments()
}

/**
 * 提交新评论
 */
async function handleSubmitComment() {
  if (!isLoggedIn.value) {
    toast.add({
      title: '请先登录',
      description: '登录后才能发表评论',
      color: 'neutral'
    })
    redirectToLogin()
    return
  }

  if (!isCommentValid.value) {
    toast.add({
      title: '评论内容不能为空',
      description: '请输入评论内容后再提交',
      color: 'warning'
    })
    return
  }

  if (isSubmittingComment.value) return

  isSubmittingComment.value = true
  try {
    await createArticleComment({
      articleId: props.articleId,
      content: commentContent.value.trim()
    })
    toast.add({
      title: '评论成功',
      color: 'success'
    })
    commentContent.value = ''
    await refreshComments()
  } catch (error) {
    console.error('发表评论失败', error)
    const description = error instanceof ApiError ? error.message : '请稍后再试'
    toast.add({
      title: '发表评论失败',
      description,
      color: 'error'
    })
  } finally {
    isSubmittingComment.value = false
  }
}

/**
 * 删除指定评论
 * @param {Article.Comment} comment 待删除的评论
 */
function handleDeleteComment(comment: Article.Comment) {
  if (!isLoggedIn.value) {
    toast.add({
      title: '请先登录',
      description: '登录后才能管理评论',
      color: 'neutral'
    })
    redirectToLogin()
    return
  }

  if (!canManageComment(comment)) {
    toast.add({
      title: '无权删除该评论',
      color: 'warning'
    })
    return
  }

  commentToDelete.value = comment
  isDeleteCommentModalOpen.value = true
}

/**
 * 确认删除评论
 */
async function confirmDeleteComment() {
  if (!commentToDelete.value) return

  const comment = commentToDelete.value
  deletingCommentId.value = comment.id

  try {
    await deleteArticleComment({
      articleId: props.articleId,
      commentId: comment.id
    })
    toast.add({
      title: '评论已删除',
      color: 'success'
    })
    isDeleteCommentModalOpen.value = false
    commentToDelete.value = null
    await refreshComments()
  } catch (error) {
    console.error('删除评论失败', error)
    const description = error instanceof ApiError ? error.message : '请稍后再试'
    toast.add({
      title: '删除评论失败',
      description,
      color: 'error'
    })
  } finally {
    deletingCommentId.value = null
  }
}

if (import.meta.client) {
  watch(
    () => isLoggedIn.value,
    () => {
      void refreshComments()
    }
  )
}

/**
 * 将评论时间格式化为本地化字符串
 * @param {string} dateString 评论时间字符串
 * @returns {string} 格式化后的时间
 */
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 批量获取评论用户信息
 */
async function fetchCommentUsers() {
  if (!comments.value.length) {
    commentUsers.value.clear()
    return
  }

  // 提取所有独特的用户 ID
  const userIds = [...new Set(comments.value.map((comment) => comment.userId))]

  // 过滤掉已经加载过的用户
  const uncachedUserIds = userIds.filter((id) => !commentUsers.value.has(id))

  if (uncachedUserIds.length === 0) return

  loadingUsers.value = true
  try {
    const users = await getUsersBriefByIds(uncachedUserIds)
    users.forEach((user) => {
      commentUsers.value.set(user.id, user)
    })
  } catch (error) {
    console.error('获取评论用户信息失败', error)
  } finally {
    loadingUsers.value = false
  }
}

/**
 * 获取指定评论的用户信息
 * @param {Article.Comment} comment 评论对象
 * @returns {User.UserBrief | null}
 */
function getCommentUser(comment: Article.Comment): User.UserBrief | null {
  return commentUsers.value.get(comment.userId) || null
}

// 当评论列表变化时，批量加载用户信息
watch(
  comments,
  () => {
    void fetchCommentUsers()
  },
  { immediate: true }
)
</script>

<template>
  <UCard ref="commentSectionEl">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">评论</h2>
          <UBadge v-if="commentCount > 0" variant="soft" color="primary">
            {{ commentCount }}
          </UBadge>
        </div>
        <UButton
          v-if="!isLoggedIn"
          size="sm"
          variant="ghost"
          color="neutral"
          icon="i-lucide-log-in"
          @click="redirectToLogin"
        >
          登录后参与评论
        </UButton>
      </div>
    </template>

    <div class="space-y-4">
      <div class="space-y-2">
        <UTextarea
          v-model="commentContent"
          class="w-full"
          :rows="4"
          placeholder="分享你的想法..."
          :disabled="isSubmittingComment || !isLoggedIn"
        />
      </div>
      <div class="flex items-center justify-between">
        <span v-if="!isLoggedIn" class="text-sm text-gray-500 dark:text-gray-400">
          登录后可以发表评论和管理评论
        </span>
        <div class="ml-auto flex items-center gap-2">
          <UButton
            color="primary"
            :disabled="!isCommentValid || isSubmittingComment || !isLoggedIn"
            :loading="isSubmittingComment"
            @click="handleSubmitComment"
          >
            提交评论
          </UButton>
          <UButton
            v-if="commentContent"
            variant="ghost"
            color="neutral"
            size="sm"
            @click="commentContent = ''"
          >
            清空
          </UButton>
        </div>
      </div>
    </div>

    <USeparator orientation="horizontal" class="my-4" />

    <div v-if="commentsPending" class="space-y-4">
      <USkeleton v-for="index in 3" :key="index" class="h-20 w-full rounded-lg" />
    </div>
    <div v-else-if="commentsErrorMessage" class="space-y-4">
      <UAlert
        icon="i-lucide-alert-circle"
        color="error"
        variant="subtle"
        title="评论加载失败"
        :description="commentsErrorMessage"
        class="border-error-200/60 border"
      />
      <UButton variant="outline" color="neutral" :loading="commentsPending" @click="reloadComments">
        重新加载评论
      </UButton>
    </div>
    <div v-else>
      <div
        v-if="comments.length === 0"
        class="py-6 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        暂无评论，快来抢沙发吧～
      </div>
      <div v-else class="space-y-4">
        <UCard v-for="comment in comments" :key="comment.id" variant="outline" class="shadow-sm">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-1">
                <UserPopoverCard v-if="getCommentUser(comment)" :user="getCommentUser(comment)!" />
                <div v-else class="flex items-center gap-2">
                  <UAvatar size="xs" />
                  <span class="text-sm font-medium text-gray-500"> 用户 {{ comment.userId }} </span>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(comment.commentTime) }}
                </span>
              </div>
              <UButton
                v-if="canManageComment(comment)"
                icon="i-lucide-trash-2"
                size="xs"
                variant="ghost"
                color="neutral"
                :loading="deletingCommentId === comment.id"
                @click="handleDeleteComment(comment)"
              >
                删除
              </UButton>
            </div>
          </template>

          <p class="text-sm leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">
            {{ comment.content }}
          </p>
        </UCard>
      </div>
    </div>

    <!-- 删除评论确认弹窗 -->
    <DeleteConfirmModal
      v-if="commentToDelete"
      v-model:open="isDeleteCommentModalOpen"
      :item-name="`来自 ${getCommentUser(commentToDelete)?.nickname || getCommentUser(commentToDelete)?.account || '用户 ' + commentToDelete.userId} 的评论`"
      title="删除评论"
      message="确定要删除这条评论吗？此操作不可撤销。"
      :loading="deletingCommentId === commentToDelete.id"
      @confirm="confirmDeleteComment"
    />
  </UCard>
</template>
