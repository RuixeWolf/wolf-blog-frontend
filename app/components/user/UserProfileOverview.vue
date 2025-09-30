<script setup lang="ts">
const props = defineProps<{
  user: User.UserInfo | null
  isSelf: boolean
  loading: boolean
  errorMessage?: string | null
}>()

/**
 * 根据用户信息组装概览字段。
 */
const infoItems = computed(() => {
  if (!props.user) return []
  return [
    {
      label: '昵称',
      value: props.user.nickname || '未设置',
      icon: 'i-lucide-badge-check'
    },
    {
      label: '账号',
      value: props.user.account,
      icon: 'i-lucide-at-sign'
    },
    {
      label: '个性签名',
      value: props.user.personalStatus || '这个用户很神秘，什么都没留下',
      icon: 'i-lucide-quote'
    },
    {
      label: '邮箱',
      value: props.user.email || '未公开',
      icon: 'i-lucide-mail'
    },
    {
      label: '手机号',
      value: props.user.phone || '未公开',
      icon: 'i-lucide-phone'
    },
    {
      label: '生日',
      value: props.user.birth || '未公开',
      icon: 'i-lucide-cake'
    },
    {
      label: '注册时间',
      value: props.user.registerDate,
      icon: 'i-lucide-calendar-days'
    }
  ] satisfies Array<{ label: string; value: string; icon: string }>
})

/**
 * 当缺失头像时使用用户名首字母作为占位。
 */
const avatarFallback = computed(() => props.user?.username?.charAt(0)?.toUpperCase() ?? 'U')
</script>

<template>
  <UCard class="overflow-hidden">
    <template #header>
      <div class="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div class="flex items-center gap-4">
          <UAvatar
            size="lg"
            :src="user?.avatar ?? undefined"
            :alt="user?.username ?? '用户头像'"
            :text="user ? undefined : avatarFallback"
          />
          <div>
            <h2 class="text-xl font-semibold">{{ user?.username ?? '用户信息加载中' }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ isSelf ? '这是你的个人主页' : 'Ta 的公开信息' }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <template #default>
      <div v-if="loading" class="space-y-4">
        <USkeleton class="h-6 w-2/3" />
        <USkeleton class="h-6 w-1/2" />
        <USkeleton class="h-6 w-full" />
        <USkeleton class="h-6 w-3/4" />
      </div>
      <div
        v-else-if="errorMessage"
        class="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/70 dark:bg-amber-500/10"
      >
        <p class="text-sm text-amber-700 dark:text-amber-200">{{ errorMessage }}</p>
      </div>
      <div v-else-if="user" class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="item in infoItems"
          :key="item.label"
          class="flex items-start gap-3 rounded-lg border border-gray-100 p-3 shadow-sm dark:border-gray-800"
        >
          <UIcon :name="item.icon" class="text-primary-500 mt-1 text-lg" />
          <div>
            <div class="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
              {{ item.label }}
            </div>
            <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {{ item.value }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-sm text-gray-500 dark:text-gray-400">暂无该用户信息</div>
    </template>
  </UCard>
</template>
