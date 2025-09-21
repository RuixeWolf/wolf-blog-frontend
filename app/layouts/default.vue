<script lang="ts" setup></script>

<template>
  <div class="min-h-screen w-full">
    <!-- 导航菜单页头 -->
    <NavigationMenuHeader />

    <!-- 页面内容 -->
    <main
      class="mx-auto h-[calc(100vh-var(--ui-header-height))] max-w-(--ui-container) px-4 sm:px-6 lg:px-8"
    >
      <slot />
    </main>
  </div>
</template>

<style></style>
