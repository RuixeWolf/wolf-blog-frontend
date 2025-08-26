<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

/** SSR 安全的用户状态 */
const currentUser = useCurrentUser()

/** 导航菜单配置 */
const navigationMenu = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: '博客文章',
      to: '/',
      icon: 'lucide:file-text'
    },
    {
      label: '关于',
      to: '/about',
      icon: 'lucide:info'
    }
  ],
  currentUser.isLoggedIn
    ? [
        {
          // 使用固定的 label 避免水合不一致
          label: currentUser.userInfo?.username,
          avatar: {
            src: currentUser.userInfo?.avatar,
            alt: '用户头像',
            icon: 'lucide:user'
          },
          slot: 'user'
        }
      ]
    : [
        {
          label: '登录',
          to: '/user/login',
          icon: 'lucide:log-in'
        },
        {
          label: '注册',
          to: '/user/register',
          icon: 'lucide:user-plus'
        }
      ]
])

/** 处理用户退出登录 */
async function handleLogout(): Promise<void> {
  await currentUser.logout()
  navigateTo('/user/login', { replace: true })
}
</script>

<template>
  <header
    class="bg-default/75 border-default sticky top-0 z-50 flex h-(--ui-header-height) items-center border-b backdrop-blur"
  >
    <!-- Nuxt UI 导航菜单 -->
    <UNavigationMenu
      class="mx-auto flex max-w-(--ui-container) flex-grow items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
      :items="navigationMenu"
      content-orientation="vertical"
    >
      <!-- 用户菜单 -->
      <template #user-content>
        <div class="max-w-xs">
          <div class="flex items-center gap-3 p-4">
            <UAvatar
              :src="currentUser.userInfo?.avatar"
              :alt="currentUser.userInfo?.username"
              class="h-10 w-10"
            />
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-medium text-gray-900 dark:text-white">
                {{ currentUser.userInfo?.username }} ({{ currentUser.userInfo?.account }})
              </div>
              <div class="truncate text-xs text-gray-500 dark:text-gray-400">
                {{ currentUser.userInfo?.email }}
              </div>
            </div>
          </div>
          <USeparator orientation="horizontal" />

          <div class="py-2">
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-lucide-user"
              class="w-full justify-start px-4 py-2"
              to="/user/profile"
            >
              个人资料
            </UButton>
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-lucide-settings"
              class="w-full justify-start px-4 py-2"
              to="/user/settings"
            >
              设置
            </UButton>
            <USeparator orientation="horizontal" class="my-2" />
            <UButton
              variant="ghost"
              color="error"
              icon="i-lucide-log-out"
              class="w-full justify-start px-4 py-2"
              @click="handleLogout()"
            >
              退出登录
            </UButton>
          </div>
        </div>
      </template>
    </UNavigationMenu>
  </header>
</template>

<style scoped>
/* 自定义导航菜单下拉内容样式 */
:deep(.navigation-menu-content) {
  width: auto !important;
  min-width: max-content;
  max-width: 320px;
}

/* 确保用户下拉菜单的宽度自适应 */
:deep([data-reka-navigation-menu-content]) {
  width: auto !important;
  min-width: fit-content;
  max-width: 24rem;
}

/* 美化下拉菜单的阴影和圆角 */
:deep([data-reka-navigation-menu-content]) {
  border-radius: 0.75rem;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* 添加动画效果 */
:deep([data-reka-navigation-menu-content]) {
  animation-duration: 200ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

:deep([data-reka-navigation-menu-content][data-state='open']) {
  animation-name: slideDownAndFade;
}

:deep([data-reka-navigation-menu-content][data-state='closed']) {
  animation-name: slideUpAndFade;
}

@keyframes slideDownAndFade {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUpAndFade {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-2px);
  }
}
</style>
