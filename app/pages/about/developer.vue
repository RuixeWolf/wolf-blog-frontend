<script lang="ts" setup>
/** 开发者 */
interface Developer {
  /** 博客用户 ID */
  userId: string
  /** 名称 */
  name: string
  /** 角色 */
  role: string
  /** 描述 */
  description: string
  /** 头像 URL */
  avatarUrl?: string
  /** 邮箱 */
  email?: string
  /** 电话 */
  phone?: string
  /** GitHub */
  github?: string
}

/** 开发者列表 */
const DEVELOPERS: Developer[] = [
  {
    userId: '1',
    name: 'Rylin Wolf · 夜凌',
    role: '后端开发',
    description: '负责网站的后端开发与维护，以及服务器的管理与运维。',
    email: 'zhangsan@example.com',
    github: 'https://github.com/RylinWolf'
  },
  {
    userId: '10007',
    name: 'Ruixe Wolf · 瑞克',
    role: '前端开发',
    avatarUrl:
      'https://gravatar.com/avatar/58917ffeb8f71e356c579b3f7d84fd92646e4b6514739a873f7ad93f0e8b8ace?size=512&d=initials',
    description: '负责网站的前端开发与维护。',
    email: 'zhangsan@example.com',
    github: 'https://github.com/RuixeWolf'
  },
  {
    userId: '3',
    name: '柏牧狼犬',
    role: 'UI 设计',
    description: '负责网站的 UI 设计',
    email: 'zhangsan@example.com'
  }
]
</script>

<template>
  <div class="h-full w-full py-2">
    <div
      v-for="developer in DEVELOPERS"
      :key="developer.userId"
      class="bg-elevated mt-6 flex w-full flex-row gap-6 rounded-lg p-6 shadow transition first:mt-0 hover:shadow-lg"
    >
      <!-- 头像 -->
      <UAvatar
        :src="developer.avatarUrl"
        :alt="developer.name"
        size="lg"
        class="h-30 w-30 flex-shrink-0 rounded"
      />
      <!-- 内容 -->
      <div class="flex h-30 flex-grow flex-col items-start justify-between">
        <div>
          <div class="flex flex-row items-center gap-4">
            <UBadge variant="subtle" color="info" icon="lucide:user">
              {{ developer.role }}
            </UBadge>
            <div class="text-2xl font-bold">{{ developer.name }}</div>
          </div>
          <div class="mt-2 text-[var(--ui-text-muted)]">
            {{ developer.description }}
          </div>
        </div>
        <div class="mt-4 flex flex-row items-center gap-3 text-xl text-[var(--ui-text-muted)]">
          <UIcon v-if="developer.email" name="lucide:mail" />
          <UIcon v-if="developer.phone" name="lucide:phone" />
          <UIcon v-if="developer.github" name="lucide:github" />
        </div>
      </div>
      <!-- 网站 Logo -->
      <div class="flex h-30 flex-shrink-0 items-center justify-center">
        <UIcon name="app-icons:wolf-blog" class="text-[var(--ui-text-muted)]" size="60" />
      </div>
    </div>
  </div>
</template>

<style></style>
