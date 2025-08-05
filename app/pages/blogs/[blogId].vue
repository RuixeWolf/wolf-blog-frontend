<script lang="ts" setup>
/** Vue Route */
const route = useRoute()

/** 博客 ID */
const blogId = route.params.blogId as string
</script>

<template>
  <div>
    <h1>博客详情 {{ blogId }}</h1>
  </div>
</template>

<style></style>
