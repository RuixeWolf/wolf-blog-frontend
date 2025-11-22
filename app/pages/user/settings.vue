<script lang="ts" setup>
import AppearanceSettings from '~/components/user/settings/AppearanceSettings.vue'
import ProfileSettings from '~/components/user/settings/ProfileSettings.vue'
import type { NavigationMenuItem } from '@nuxt/ui'

/** 当前登录用户状态 */
const currentUser = useCurrentUser()
const route = useRoute()

/** 侧边栏导航项 */
const sidebarItems = computed<NavigationMenuItem[]>(() => [
  {
    label: '个人资料',
    icon: 'i-lucide-user',
    to: { query: { tab: 'profile' } },
    active: !route.query.tab || route.query.tab === 'profile'
  },
  {
    label: '外观主题',
    icon: 'i-lucide-palette',
    to: { query: { tab: 'appearance' } },
    active: route.query.tab === 'appearance'
  }
])

/** 当前激活的标签页 */
const activeTab = computed(() => (route.query.tab as string) || 'profile')

const loginRedirectPath = computed(() => {
  const redirect = encodeURIComponent(route.fullPath)
  return `/user/login?redirect=${redirect}`
})

/**
 * 判断当前是否已登录。
 */
const isLoggedIn = computed(() => currentUser.isLoggedIn)
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-6 lg:px-8">
    <div class="flex flex-col gap-8 lg:flex-row">
      <!-- 侧边栏导航 -->
      <aside class="w-full shrink-0 lg:w-64">
        <div class="sticky top-20 space-y-6">
          <div>
            <h1 class="text-2xl font-semibold">设置</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">管理您的账户设置</p>
          </div>
          <UNavigationMenu :items="sidebarItems" orientation="vertical" class="w-full" />
        </div>
      </aside>

      <!-- 主内容区域 -->
      <main class="min-w-0 flex-1">
        <UAlert
          v-if="!isLoggedIn"
          icon="i-lucide-lock"
          color="warning"
          variant="subtle"
          title="当前处于未登录状态"
          class="mb-6"
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

        <!-- 个人资料设置 -->
        <ProfileSettings v-else-if="activeTab === 'profile'" />

        <!-- 外观主题设置 -->
        <AppearanceSettings v-else-if="activeTab === 'appearance'" />
      </main>
    </div>
  </div>
</template>
