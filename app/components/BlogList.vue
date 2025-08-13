<script lang="ts" setup>
/** 组件参数 */
const props = defineProps<{
  /** 作者 ID */
  authorId?: string
}>()

/** 博客列表 */
const { data: blogs } = useFetch<ApiListResponse<Blog.BlogInfo>>('/api/blogs', {
  method: 'POST',
  body: {
    authorId: props.authorId
  },
  onResponse({ response }) {
    return response.json()
  }
})
</script>

<template>
  <div>
    <h1 class="mb-4 text-2xl font-bold">博客列表</h1>
    <ul>
      <li v-for="blog in blogs?.data.records" :key="blog.id">
        <NuxtLink :to="`/blogs/${blog.id}`">{{ blog.title }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style></style>
