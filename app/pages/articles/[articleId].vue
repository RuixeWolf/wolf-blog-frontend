<script lang="ts" setup>
/** Vue Route */
const route = useRoute()

/** 文章 ID */
const articleId = route.params.articleId as string
</script>

<template>
  <div>
    <h1>文章详情 {{ articleId }}</h1>
  </div>
</template>

<style></style>
