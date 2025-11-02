<script lang="ts" setup>
import { getArticleComments, getArticlePartitions, queryArticles } from '~/apis/article'
import { getUserInfo } from '~/apis/user'
import UserArticleList from '~/components/user/UserArticleList.vue'
import UserCommentsPanel from '~/components/user/UserCommentsPanel.vue'
import UserFavoritesPanel from '~/components/user/UserFavoritesPanel.vue'
import UserPartitionsPanel from '~/components/user/UserPartitionsPanel.vue'
import UserProfileOverview from '~/components/user/UserProfileOverview.vue'

type SimpleArticle = Pick<Article.ArticleInfo, 'id' | 'title' | 'postTime' | 'views'>

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
  data: ownerArticles,
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

const ownerArticleList = computed(() => ownerArticles.value ?? [])
/**
 * 将文章列表规范化，提取用于评论拉取所需的最小字段。
 */
const normalizedArticles = computed<SimpleArticle[]>(() =>
  ownerArticleList.value.map((record) => ({
    id: record.id,
    title: record.title,
    postTime: record.postTime,
    views: 'views' in record ? (record.views ?? 0) : 0
  }))
)

const comments = ref<CommentEntry[]>([])
const commentsPending = ref(false)
const commentsError = ref<Error | null>(null)
let commentsRequestToken = 0

/**
 * 按照最近文章批量拉取最新评论。
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

  if (!normalizedArticles.value.length) {
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
    const articleChunks = normalizedArticles.value.slice(0, 8)
    const responses = await Promise.all(
      articleChunks.map(async (article) => {
        const page = await getArticleComments({
          articleId: article.id,
          pageNumber: 1,
          pageSize: 5
        })
        return page.records.map((comment) => ({ article, comment }))
      })
    )

    if (token !== commentsRequestToken) return

    const flattened = responses
      .flat()
      .sort(
        (a, b) =>
          new Date(b.comment.commentTime ?? '').getTime() -
          new Date(a.comment.commentTime ?? '').getTime()
      )

    comments.value = flattened
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
    pending: ownerArticlesPending.value,
    key: normalizedArticles.value.map((item) => item.id).join(',')
  }),
  ({ pending }) => {
    if (pending) return
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
        label: '评论管理',
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

/**
 * 汇总页面各区域的加载状态，用于刷新按钮联动。
 */
const _combinedRefreshing = computed(
  () =>
    userPending.value ||
    ownerArticlesPending.value ||
    (isSelf.value && (partitionsPending.value || commentsPending.value))
)
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:px-0">
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
      <UserProfileOverview
        :user="profileUserInfo"
        :is-self="isSelf"
        :loading="userPending"
        :error-message="userErrorMessage"
      />

      <UTabs
        v-if="tabItems.length"
        v-model="activeTab"
        :items="tabItems"
        orientation="horizontal"
        :unmount-on-hide="false"
        variant="pill"
        size="md"
        class="w-full"
      >
        <template #content="{ item }">
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
              :normalized-article-count="normalizedArticles.length"
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
        </template>
      </UTabs>
    </template>
  </div>
</template>
