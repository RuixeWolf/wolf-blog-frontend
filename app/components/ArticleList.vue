<script lang="ts" setup>
/** 组件参数 */
const props = defineProps<{
  /** 作者 ID */
  authorId?: string
}>()

/** 文章列表 */
const { data: articleList } = useApi<ApiListData<Article.ArticleInfo>>('/article/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/nullable+json' },
  body: {
    authorId: props.authorId
  }
})
</script>

<template>
  <div>
    <h1 class="mb-4 text-2xl font-bold">文章列表</h1>
    <ul>
      <li v-for="article in articleList?.records" :key="article.id">
        <NuxtLink :to="`/articles/${article.id}`">{{ article.title }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped></style>
