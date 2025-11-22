<script lang="ts" setup>
const FEATURES = [
  {
    icon: 'lucide:pen-tool',
    title: '极致创作体验',
    description: '支持 Markdown 实时预览，提供流畅的写作环境，让您专注于内容创作。'
  },
  {
    icon: 'lucide:users',
    title: '活跃社区氛围',
    description: '评论、点赞、收藏，与志同道合的开发者一起交流技术心得。'
  },
  {
    icon: 'lucide:zap',
    title: '高性能架构',
    description: '基于 Nuxt 4 构建，SSR 服务端渲染，秒级加载，SEO 友好。'
  },
  {
    icon: 'lucide:palette',
    title: '现代化 UI 设计',
    description: '精心打磨的界面交互，支持深色模式，提供舒适的阅读体验。'
  }
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 介绍卡片 -->
    <div class="bg-default rounded-lg p-8 shadow transition hover:shadow-lg">
      <div class="mb-6 flex items-center gap-4">
        <UIcon name="app-icons:wolf-blog" class="text-primary h-12 w-12" />
        <h1 class="text-3xl font-bold">Wolf Blog</h1>
      </div>
      <p class="text-muted text-lg leading-relaxed">
        Wolf Blog
        是一个由技术爱好者构建的现代化博客平台。我们致力于为开发者提供一个纯粹、高效的知识分享空间。
        在这里，你可以记录学习笔记、分享技术见解、探讨前沿科技。我们相信，分享是学习的最好方式。
      </p>
    </div>

    <!-- 特性列表 -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div
        v-for="feature in FEATURES"
        :key="feature.title"
        class="bg-default flex flex-col gap-4 rounded-lg p-6 shadow transition hover:shadow-lg"
      >
        <div class="bg-primary-50 dark:bg-primary-950/30 w-fit rounded-lg p-3">
          <UIcon :name="feature.icon" class="text-primary h-8 w-8" />
        </div>
        <div>
          <h3 class="mb-2 text-xl font-bold">{{ feature.title }}</h3>
          <p class="text-muted">{{ feature.description }}</p>
        </div>
      </div>
    </div>

    <!-- 技术栈/开源声明 -->
    <div class="bg-default rounded-lg p-8 shadow transition hover:shadow-lg">
      <h2 class="mb-4 text-2xl font-bold">开源与技术</h2>
      <p class="text-muted mb-6 leading-relaxed">
        Wolf Blog 秉持开源精神，前端采用 <strong>Nuxt 4</strong>、<strong>Vue 3</strong> 和
        <strong>Tailwind CSS</strong> 构建，
        后端采用高效稳定的服务架构。我们欢迎每一位开发者参与到项目的贡献中来。
      </p>
      <div class="flex gap-4">
        <UButton
          to="https://github.com/RuixeWolf/wolf-blog-frontend"
          target="_blank"
          icon="lucide:github"
          color="neutral"
          variant="soft"
        >
          前端仓库
        </UButton>
        <UButton
          to="https://github.com/RylinWolf/WolfHouseBlog"
          target="_blank"
          icon="lucide:github"
          color="neutral"
          variant="soft"
        >
          后端仓库
        </UButton>
        <UButton to="/about/developer" icon="lucide:code-2" color="primary" variant="soft">
          认识开发团队
        </UButton>
      </div>
    </div>
  </div>
</template>

<style></style>
