<script lang="ts" setup>
import { getArticleComments, getArticlePartitions, queryArticles } from '~/apis/article'
import { getUserInfo } from '~/apis/user'
import UserArticleList from '~/components/user/UserArticleList.vue'
import UserCommentsPanel from '~/components/user/UserCommentsPanel.vue'
import UserFavoritesPanel from '~/components/user/UserFavoritesPanel.vue'
import UserPartitionsPanel from '~/components/user/UserPartitionsPanel.vue'
import UserProfileOverview from '~/components/user/UserProfileOverview.vue'

interface SimpleArticle {
  id: number
  title: string
  postTime: string | null
  views: number | null
}

interface CommentEntry {
  article: SimpleArticle
  comment: Article.Comment
}

type TabValue = 'articles' | 'favorites' | 'comments' | 'partitions'

interface UserTabItem {
  label: string
  icon: string
  value: TabValue
  badge?: string | number
}

const route = useRoute()
const currentUser = useCurrentUser()

/**
 * 解析路由参数中的用户 ID。
 * @returns {number|null} 返回合法数字则为用户 ID，否则为 null。
 */
const profileUserId = computed<number | null>(() => {
  const raw = Number(route.params.userId)
  return Number.isFinite(raw) ? raw : null
})

/**
 * 判断当前访问者是否正在查看自己的主页。
 */
const isSelf = computed(
  () => profileUserId.value != null && currentUser.userInfo?.id === profileUserId.value
)

const {
  data: userInfo,
  pending: userPending,
  error: userError,
  refresh: _refreshUserInfo
} = useAsyncData<User.UserInfo | null>(
  () => `user-profile-${profileUserId.value ?? 'unknown'}`,
  async () => {
    if (profileUserId.value == null) return null
    return await getUserInfo(profileUserId.value)
  },
  { watch: [profileUserId] }
)

/**
 * 用户资料接口报错信息，便于展示友好提示。
 */
const userErrorMessage = computed(() => userError.value?.message ?? null)

/**
 * 经过空值处理后的用户资料对象。
 */
const profileUserInfo = computed<User.UserInfo | null>(() => userInfo.value ?? null)

const pageTitle = computed(() => {
  if (!profileUserInfo.value) return '用户中心'
  const displayName = profileUserInfo.value.nickname || profileUserInfo.value.username
  return `${displayName} 的主页`
})

useSeoMeta({
  title: () => pageTitle.value,
  description: () =>
    profileUserInfo.value?.personalStatus
      ? `${profileUserInfo.value.personalStatus} - Wolf Blog 用户主页`
      : 'Wolf Blog 用户个人主页'
})

const ownerArticlePageSize = 20

const {
  data: _ownerArticles,
  pending: ownerArticlesPending,
  error: ownerArticlesError,
  refresh: _refreshOwnerArticles
} = useAsyncData<Article.ArticleQueryRecord[]>(
  () => `user-owner-articles-${profileUserId.value ?? 'unknown'}`,
  async () => {
    if (!isSelf.value || profileUserId.value == null) return []
    const response = await queryArticles({
      authorId: profileUserId.value,
      pageNumber: 1,
      pageSize: ownerArticlePageSize,
      sort: [{ field: 'postTime', isAsc: false }]
    })
    return response.records ?? []
  },
  { watch: [isSelf, profileUserId] }
)

/**
 * 作者文章接口报错信息。
 */
const ownerArticlesErrorMessage = computed(() => ownerArticlesError.value?.message ?? null)

const comments = ref<CommentEntry[]>([])
const commentsPending = ref(false)
const commentsError = ref<Error | null>(null)
let commentsRequestToken = 0

/**
 * 拉取当前用户发表的所有评论。
 * @returns {Promise<void>} 异步操作完成后返回。
 */
async function reloadComments(): Promise<void> {
  const token = ++commentsRequestToken

  if (!isSelf.value || profileUserId.value == null) {
    if (token === commentsRequestToken) {
      comments.value = []
      commentsPending.value = false
      commentsError.value = null
    }
    return
  }

  commentsPending.value = true
  commentsError.value = null

  try {
    const page = await getArticleComments({
      userId: profileUserId.value,
      pageNumber: 1,
      pageSize: 20
    })

    if (token !== commentsRequestToken) return

    // 将评论数据转换为 CommentEntry 格式
    comments.value = page.records.map((comment) => ({
      article: {
        id: comment.articleId ?? 0,
        title: `文章 #${comment.articleId ?? 0}`,
        postTime: null,
        views: null
      },
      comment
    }))
  } catch (error) {
    if (token !== commentsRequestToken) return
    commentsError.value = error instanceof Error ? error : new Error('评论加载失败')
    comments.value = []
  } finally {
    if (token === commentsRequestToken) {
      commentsPending.value = false
    }
  }
}

watch(
  () => ({
    own: isSelf.value,
    userId: profileUserId.value
  }),
  () => {
    void reloadComments()
  },
  { immediate: true }
)

const {
  data: partitions,
  pending: partitionsPending,
  error: partitionsError,
  refresh: refreshPartitions
} = useAsyncData<Article.Partition[]>(
  () => `user-partitions-${profileUserId.value ?? 'unknown'}`,
  async () => {
    if (!isSelf.value) return []
    return await getArticlePartitions()
  },
  { watch: [isSelf] }
)

/**
 * 分区接口错误信息。
 */
const partitionsErrorMessage = computed(() => partitionsError.value?.message ?? null)

/**
 * 将树状分区结构拉平成携带层级信息的数组。
 * @param {Article.Partition[]|undefined} partitionList 原始分区数据。
 * @param {number} depth 当前递归深度。
 */
function flattenPartitions(
  partitionList: Article.Partition[] | undefined,
  depth: number = 0
): Array<{ partition: Article.Partition; depth: number }> {
  if (!partitionList?.length) return []

  return partitionList.flatMap((partition) => [
    { partition, depth },
    ...flattenPartitions(partition.children, depth + 1)
  ])
}

const partitionRows = computed(() => flattenPartitions(partitions.value ?? []))

const activeTab = ref<TabValue>('articles')

/**
 * 构建用户中心的分页标签配置。
 */
const tabItems = computed<UserTabItem[]>(() => {
  const items: UserTabItem[] = [{ label: '文章', icon: 'i-lucide-newspaper', value: 'articles' }]

  if (isSelf.value) {
    const commentsCount = comments.value.length
    const partitionsCount = partitionRows.value.length

    items.push(
      { label: '收藏夹', icon: 'i-lucide-heart', value: 'favorites' },
      {
        label: '我的评论',
        icon: 'i-lucide-message-circle',
        value: 'comments',
        badge: commentsCount ? commentsCount : undefined
      },
      {
        label: '分区管理',
        icon: 'i-lucide-layers',
        value: 'partitions',
        badge: partitionsCount ? partitionsCount : undefined
      }
    )
  }

  return items
})

watch(
  tabItems,
  (items) => {
    if (!items.length) return
    if (!items.some((item) => item.value === activeTab.value)) {
      const firstItem = items[0]
      if (firstItem) {
        activeTab.value = firstItem.value
      }
    }
  },
  { immediate: true }
)

/** SEO 设置 */
useSeo(
  computed<SeoData>(() => {
    if (!userInfo.value) {
      return {
        title: '用户资料',
        description: '查看用户资料和发布的文章'
      }
    }

    const user = userInfo.value
    return {
      title: `${user.nickname || user.account}的主页`,
      description:
        user.personalStatus || `${user.nickname || user.account} 的个人主页，查看发布的文章和动态`,
      keywords: `用户,${user.account},${user.nickname || ''},博客,文章`.trim(),
      author: user.nickname || user.account
    }
  })
)
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-6 lg:px-0">
    <UAlert
      v-if="profileUserId === null"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-triangle"
      title="无法识别的用户 ID"
    >
      请检查访问的链接是否正确。
    </UAlert>

    <template v-else>
      <!-- 左右布局容器 -->
      <div class="flex flex-col gap-6 lg:flex-row">
        <!-- 左侧：用户信息卡片 -->
        <aside class="w-full shrink-0 lg:w-80">
          <div class="sticky top-20">
            <UserProfileOverview
              :user="profileUserInfo"
              :is-self="isSelf"
              :loading="userPending"
              :error-message="userErrorMessage"
            />
          </div>
        </aside>

        <!-- 右侧：功能标签 -->
        <main class="min-w-0 flex-1">
          <UTabs
            v-if="tabItems.length"
            v-model="activeTab"
            :items="tabItems"
            orientation="horizontal"
            :unmount-on-hide="false"
            variant="pill"
            size="md"
            class="w-full"
            :ui="{ list: 'shadow-lg bg-default mb-2' }"
          >
            <template #content="{ item }">
              <div class="bg-default w-full rounded-lg p-4 shadow-lg">
                <template v-if="item.value === 'articles'">
                  <div id="user-articles" class="space-y-6">
                    <UserArticleList v-if="profileUserId" :user-id="profileUserId" :page-size="8" />
                  </div>
                </template>

                <template v-else-if="item.value === 'favorites'">
                  <div v-if="isSelf && profileUserId" id="user-favorites" class="space-y-6">
                    <UserFavoritesPanel :user-id="profileUserId" />
                  </div>
                </template>

                <template v-else-if="item.value === 'comments'">
                  <UserCommentsPanel
                    :comments="comments"
                    :comments-pending="commentsPending"
                    :owner-articles-pending="ownerArticlesPending"
                    :owner-articles-error-message="ownerArticlesErrorMessage"
                    :comments-error="commentsError"
                    @refresh="() => reloadComments()"
                  />
                </template>

                <template v-else-if="item.value === 'partitions'">
                  <UserPartitionsPanel
                    :partition-rows="partitionRows"
                    :partitions-pending="partitionsPending"
                    :partitions-error-message="partitionsErrorMessage"
                    @refresh="() => refreshPartitions()"
                  />
                </template>
              </div>
            </template>
          </UTabs>
        </main>
      </div>
    </template>
  </div>
</template>
