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

/**
 * 移动端详细信息默认折叠状态
 */
const detailsOpen = ref(false)
</script>

<template>
  <UCard class="h-full overflow-hidden shadow-lg ring-0">
    <template #default>
      <div v-if="loading" class="space-y-4">
        <div class="flex flex-col items-center">
          <USkeleton class="h-24 w-24 rounded-full" />
          <USkeleton class="mt-4 h-6 w-32" />
          <USkeleton class="mt-2 h-4 w-24" />
        </div>
        <div class="space-y-3">
          <USkeleton class="h-12 w-full" />
          <USkeleton class="h-12 w-full" />
          <USkeleton class="h-12 w-full" />
        </div>
      </div>
      <div
        v-else-if="errorMessage"
        class="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/70 dark:bg-amber-500/10"
      >
        <p class="text-sm text-amber-700 dark:text-amber-200">{{ errorMessage }}</p>
      </div>
      <div v-else-if="user" class="space-y-6">
        <!-- 头像和基本信息 -->
        <div class="flex flex-col items-center text-center">
          <UAvatar
            size="2xl"
            :src="user?.avatar ?? undefined"
            :alt="user?.username ?? '用户头像'"
            :text="avatarFallback"
            class="ring-4 ring-gray-100 dark:ring-gray-800"
          />
          <h2 class="mt-4 text-xl font-bold text-gray-900 dark:text-white">
            {{ user.username }}
          </h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ props.user?.personalStatus }}
          </p>
          <p
            v-if="user.personalStatus"
            class="mt-3 text-sm text-gray-600 italic dark:text-gray-300"
          >
            "{{ user.personalStatus }}"
          </p>
        </div>

        <USeparator />

        <!-- 详细信息列表 - 桌面端直接显示，移动端可折叠 -->
        <!-- 桌面端 (lg+) 直接显示 -->
        <div class="hidden space-y-2 lg:block">
          <div
            v-for="item in infoItems"
            :key="item.label"
            class="flex items-center gap-2.5 px-1 py-1.5"
          >
            <UIcon :name="item.icon" class="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
            <div class="min-w-0 flex-1">
              <div class="flex items-baseline gap-2">
                <div class="w-14 text-xs text-gray-500 dark:text-gray-400">{{ item.label }}</div>
                <span class="truncate text-sm text-gray-900 dark:text-gray-100">{{
                  item.value
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 移动端 (< lg) 可折叠 -->
        <UCollapsible v-model:open="detailsOpen" class="flex flex-col gap-2 lg:hidden">
          <UButton
            class="group"
            label="个人信息"
            color="neutral"
            variant="ghost"
            trailing-icon="i-lucide-chevron-down"
            :ui="{
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
            }"
            size="sm"
            block
          />

          <template #content>
            <div class="space-y-2">
              <div
                v-for="item in infoItems"
                :key="item.label"
                class="flex items-center gap-2.5 px-1 py-1.5"
              >
                <UIcon
                  :name="item.icon"
                  class="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-baseline gap-2">
                    <div class="w-14 text-xs text-gray-500 dark:text-gray-400">
                      {{ item.label }}
                    </div>
                    <span class="truncate text-sm text-gray-900 dark:text-gray-100">{{
                      item.value
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </UCollapsible>
      </div>
      <div v-else class="text-center text-sm text-gray-500 dark:text-gray-400">暂无该用户信息</div>
    </template>
  </UCard>
</template>
