<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

/** SSR 安全的用户状态 */
const currentUser = useCurrentUser()

/** 中心导航菜单配置（博客文章） */
const centerNavigationMenu = computed<NavigationMenuItem[]>(() => [
  {
    label: '首页',
    to: '/',
    icon: 'lucide:file-text'
  }
])

/** 右侧用户菜单配置 */
const rightNavigationMenu = computed<NavigationMenuItem[]>(() => [
  {
    label: '关于',
    to: '/about',
    icon: 'lucide:info'
  },
  ...(currentUser.isLoggedIn
    ? [
        {
          // 使用固定的 label 避免水合不一致
          label: currentUser.userInfo?.username,
          avatar: {
            src: currentUser.userInfo?.avatar ?? undefined,
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
      ])
])

/** 处理用户退出登录 */
async function handleLogout(): Promise<void> {
  await currentUser.logout()
  navigateTo('/user/login', { replace: true })
}
</script>

<template>
  <UHeader>
    <!-- 左侧：Wolf Blog LOGO -->
    <template #title>
      <div class="flex items-center gap-2 text-2xl font-bold">
        <UIcon name="app-icons:wolf-blog" class="mr-1 size-10" />
        <span>Wolf Blog</span>
      </div>
    </template>

    <!-- 中间：博客文章、关于导航菜单 -->
    <UNavigationMenu :items="centerNavigationMenu" />

    <!-- 右侧：关于按钮、颜色模式选择器、用户菜单 -->
    <template #right>
      <UColorModeSelect variant="ghost" />
      <UNavigationMenu :items="rightNavigationMenu" content-orientation="vertical">
        <!-- 用户下拉菜单 -->
        <template #user-content>
          <div>
            <UUser
              :name="currentUser.userInfo?.username"
              :description="currentUser.userInfo?.account"
              :avatar="{
                src: currentUser.userInfo?.avatar ?? undefined,
                alt: currentUser.userInfo?.username
              }"
              size="lg"
              class="p-4"
            />
            <USeparator orientation="horizontal" />
            <div class="py-2">
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-lucide-user"
                class="w-full justify-start px-4 py-2"
                :to="`/user/${currentUser.userInfo?.id}`"
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
    </template>
  </UHeader>
</template>
