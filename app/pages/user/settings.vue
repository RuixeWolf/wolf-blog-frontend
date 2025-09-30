<script lang="ts" setup>
import { updateUserProfile } from '~/apis/user'

/** Nuxt UI 的消息提示 */
const toast = useToast()

/** 当前登录用户状态 */
const currentUser = useCurrentUser()
const route = useRoute()

const loginRedirectPath = computed(() => {
  const redirect = encodeURIComponent(route.fullPath)
  return `/user/login?redirect=${redirect}`
})

/** 支持编辑的资料字段列表 */
const profileFields = ['avatar', 'nickname', 'personalStatus', 'email', 'phone', 'birth'] as const

type ProfileFieldKey = (typeof profileFields)[number]

/**
 * 用户资料表单数据，使用字符串存储，便于与输入控件双向绑定。
 */
const formState = reactive<Record<ProfileFieldKey, string>>({
  avatar: '',
  nickname: '',
  personalStatus: '',
  email: '',
  phone: '',
  birth: ''
})

/**
 * 记录用户资料的初始状态，用于判断是否有改动。
 */
const initialState = ref<Record<ProfileFieldKey, string | null>>({
  avatar: null,
  nickname: null,
  personalStatus: null,
  email: null,
  phone: null,
  birth: null
})

/** 表单提交加载状态 */
const saving = ref(false)

/**
 * 判断当前是否已登录。
 */
const isLoggedIn = computed(() => currentUser.isLoggedIn)

/**
 * 当前用户信息引用，便于监听变化。
 */
const userInfo = computed(() => currentUser.userInfo)

/**
 * 将可空字符串转换为输入框使用的值。
 */
function toInputValue(value: string | null | undefined): string {
  return value ?? ''
}

/**
 * 将表单输入值规范化：去除首尾空白，空字符串视为 null。
 */
function normalizeFieldValue(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * 根据当前用户信息填充表单，并记录初始快照。
 */
function applyUserInfoSnapshot(user: User.UserInfo | null) {
  profileFields.forEach((key) => {
    const rawValue = user?.[key as keyof User.UserInfo]
    if (typeof rawValue === 'string' || rawValue === null || rawValue === undefined) {
      formState[key] = toInputValue(rawValue)
      initialState.value[key] = rawValue ?? null
    }
  })
}

/**
 * 监听用户信息变化，初始化或刷新表单内容。
 */
watch(
  userInfo,
  (user) => {
    applyUserInfoSnapshot(user ?? null)
  },
  { immediate: true }
)

/**
 * 计算当前表单的规范化结果，便于比较和构建请求负载。
 */
const normalizedFormState = computed<Record<ProfileFieldKey, string | null>>(() => {
  const result = {} as Record<ProfileFieldKey, string | null>
  profileFields.forEach((key) => {
    result[key] = normalizeFieldValue(formState[key])
  })
  return result
})

/**
 * 是否存在未保存的更改。
 */
const hasUnsavedChanges = computed(() =>
  profileFields.some((key) => normalizedFormState.value[key] !== initialState.value[key])
)

/**
 * 构建包含所有字段的更新请求体，未填写的值传递为 null。
 */
function buildUpdatePayload(): User.UpdateProfileRequest {
  const payload: User.UpdateProfileRequest = {}
  profileFields.forEach((key) => {
    payload[key] = normalizedFormState.value[key] ?? null
  })
  return payload
}

/**
 * 将表单重置为初始状态。
 */
function handleResetForm() {
  profileFields.forEach((key) => {
    formState[key] = toInputValue(initialState.value[key])
  })
}

/**
 * 提交用户资料更新。
 */
async function handleSubmit() {
  if (!isLoggedIn.value) {
    toast.add({
      title: '请先登录',
      description: '登录后即可更新个人资料。',
      color: 'warning'
    })
    await navigateTo(loginRedirectPath.value)
    return
  }

  if (!hasUnsavedChanges.value) {
    toast.add({
      title: '未检测到修改',
      description: '请先调整需要更新的资料再保存。',
      color: 'neutral'
    })
    return
  }

  try {
    saving.value = true
    const payload = buildUpdatePayload()
    const updatedUser = await updateUserProfile(payload)
    toast.add({
      title: '资料已更新',
      description: '个人资料保存成功。',
      color: 'success'
    })
    // 同步 Pinia 仓库中的用户信息
    currentUser.userInfo = updatedUser
    applyUserInfoSnapshot(updatedUser)
  } catch (error) {
    console.error('更新用户资料失败', error)
    toast.add({
      title: '保存失败',
      description: error instanceof Error ? error.message : '请稍后再试',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

/**
 * 若用户已登录但资料尚未加载完成，则显示加载状态。
 */
const pendingUserInfo = computed(() => isLoggedIn.value && !userInfo.value)

onMounted(() => {
  if (isLoggedIn.value && !userInfo.value) {
    void currentUser.refreshUserInfo()
  }
})
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 lg:px-0">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold">账户设置</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">管理个人资料与联系方式</p>
      </div>
      <UButton
        v-if="isLoggedIn"
        icon="i-lucide-user"
        variant="outline"
        color="neutral"
        :to="userInfo ? `/user/${userInfo.id}` : '/user/login'"
      >
        查看我的主页
      </UButton>
    </div>

    <UAlert
      v-if="!isLoggedIn"
      icon="i-lucide-lock"
      color="warning"
      variant="subtle"
      title="当前处于未登录状态"
    >
      <template #description>
        <div class="flex flex-col gap-3">
          <span>请登录后再访问账户设置页面。</span>
          <div>
            <UButton color="primary" :to="loginRedirectPath">前往登录</UButton>
          </div>
        </div>
      </template>
    </UAlert>

    <UCard v-else>
      <template #header>
        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-semibold">个人资料</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">更新昵称、头像与个性签名等信息</p>
        </div>
      </template>

      <div v-if="pendingUserInfo" class="space-y-4">
        <USkeleton class="h-16 w-full" />
        <USkeleton class="h-16 w-full" />
        <USkeleton class="h-16 w-full" />
      </div>
      <div v-else class="space-y-6">
        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-4">
            <UFormField label="头像链接" name="avatar" help="支持 https:// 开头的图片地址">
              <div class="flex items-center gap-4">
                <UAvatar :src="formState.avatar || undefined" size="lg" />
                <UInput
                  v-model="formState.avatar"
                  placeholder="https://example.com/avatar.png"
                  class="flex-1"
                />
              </div>
            </UFormField>

            <UFormField label="昵称" name="nickname" hint="公开展示名称">
              <UInput v-model="formState.nickname" placeholder="请输入昵称" />
            </UFormField>

            <UFormField label="个性签名" name="personalStatus" description="最多 60 个字符">
              <UTextarea
                v-model="formState.personalStatus"
                :rows="3"
                placeholder="写点什么介绍自己吧"
              />
            </UFormField>
          </div>

          <div class="space-y-4">
            <UFormField label="账号" name="account">
              <UInput :model-value="userInfo?.account ?? ''" disabled />
            </UFormField>

            <UFormField label="用户名" name="username">
              <UInput :model-value="userInfo?.username ?? ''" disabled />
            </UFormField>

            <UFormField label="注册时间" name="registerDate">
              <UInput :model-value="userInfo?.registerDate ?? ''" disabled />
            </UFormField>
          </div>
        </div>

        <USeparator />

        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-4">
            <UFormField label="电子邮箱" name="email" description="用于找回密码和接收通知">
              <UInput v-model="formState.email" placeholder="your@email.com" type="email" />
            </UFormField>

            <UFormField label="联系手机号" name="phone" description="仅自己可见">
              <UInput v-model="formState.phone" placeholder="请输入手机号" />
            </UFormField>
          </div>

          <div class="space-y-4">
            <UFormField label="出生日期" name="birth">
              <UInput v-model="formState.birth" type="date" />
            </UFormField>

            <div
              class="border-primary-200/60 bg-primary-50/70 text-primary-700 dark:border-primary-400/50 dark:bg-primary-500/10 dark:text-primary-200 rounded-lg border p-4 text-sm"
            >
              保存后，资料将在个人主页中同步展示。若需要清空某项内容，请将输入框留空并保存。
            </div>
          </div>
        </div>

        <div
          class="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-end dark:border-gray-800"
        >
          <UButton
            variant="ghost"
            color="neutral"
            :disabled="!hasUnsavedChanges"
            @click="handleResetForm"
          >
            恢复未保存的更改
          </UButton>
          <UButton
            icon="i-lucide-save"
            color="primary"
            :loading="saving"
            :disabled="!hasUnsavedChanges"
            @click="handleSubmit"
          >
            保存资料
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>
