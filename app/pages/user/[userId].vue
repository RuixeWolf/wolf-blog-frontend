<script lang="ts" setup>
/** Vue Route */
const route = useRoute()

/** 用户 ID */
const userId = route.params.userId as string
</script>

<template>
  <div class="">
    <h1 class="text-2xl font-bold">用户中心 {{ userId }}</h1>
    <p class="mt-4">欢迎来到用户中心页面！</p>
    <p>这里可以展示用户的个人信息、设置等内容。</p>
    <!-- 其他用户相关内容 -->
  </div>
</template>

<style lang="scss" scoped></style>
