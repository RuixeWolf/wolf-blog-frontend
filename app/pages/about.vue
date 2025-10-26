<script lang="ts" setup>
import { navigateTo, useRoute } from '#app'

/** 侧边导航栏内容 */
const SIDEBAR_NAVIGATION_ITEMS = [
  { title: '关于我们', path: '/about/about-us' },
  { title: '开发人员', path: '/about/developer' },
  { title: '版本历史更新', path: '/about/version-history' }
]

// 当访问 /about 时，默认跳转到 /about/about-us
const route = useRoute()
if (route.path === '/about') {
  navigateTo('/about/about-us')
}

/** 页面标题 */
useHead({
  title: 'Wolf Blog - 关于'
})
</script>

<template>
  <div class="flex h-full flex-row gap-10 py-10">
    <!-- 左侧导航侧边栏 -->
    <div class="bg-accented flex h-full w-60 flex-col gap-4 rounded-2xl px-2 py-20 shadow-xl">
      <NuxtLink
        v-for="item in SIDEBAR_NAVIGATION_ITEMS"
        :key="item.path"
        :to="item.path"
        class="bg-muted text-muted hover:bg-default hover:text-default flex flex-row items-center justify-between rounded-lg px-4 py-2 text-lg font-medium shadow transition hover:shadow-lg"
        :class="{
          'bg-default! text-default! shadow-lg': $route.path === item.path
        }"
      >
        <div class="grow text-center">{{ item.title }}</div>
        <UIcon name="lucide:chevron-right" />
      </NuxtLink>
    </div>
    <!-- 右侧子页面内容 -->
    <div class="h-full grow rounded-2xl">
      <NuxtPage />
    </div>
  </div>
</template>

<style></style>
