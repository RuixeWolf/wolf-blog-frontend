<script lang="ts" setup></script>

<template>
  <div class="bg-elevated/50 min-h-screen w-full">
    <!-- 导航菜单页头 -->
    <NavigationMenuHeader />

    <!-- 页面内容 -->
    <UMain
      class="mx-auto min-h-[calc(100vh-var(--ui-header-height))] max-w-(--ui-container) px-4 sm:px-6 lg:px-8"
    >
      <slot />
    </UMain>
  </div>
</template>

<style></style>
