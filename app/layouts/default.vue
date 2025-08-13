<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

/** 导航菜单配置 */
const navigationMenu = ref<NavigationMenuItem[]>([
  {
    label: '首页',
    to: '/',
    icon: 'lucide:house'
  },
  {
    label: '博客列表',
    to: '/blogs',
    icon: 'lucide:file-text'
  },
  {
    label: '关于',
    to: '/about'
  }
])
</script>

<template>
  <div class="min-h-screen min-w-screen">
    <header
      class="bg-default/75 border-default sticky top-0 z-50 h-(--ui-header-height) border-b backdrop-blur"
    >
      <!-- Nuxt UI 导航菜单 -->
      <UNavigationMenu
        class="mx-auto flex h-full w-full max-w-(--ui-container) items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
        :items="navigationMenu"
      />
    </header>

    <!-- 页面内容 -->
    <main class="min-h-[calc(100vh-var(--ui-header-height))]">
      <div class="mx-auto max-w-(--ui-container) px-4 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>
  </div>
</template>

<style></style>
