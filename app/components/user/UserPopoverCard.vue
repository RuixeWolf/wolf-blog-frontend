<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  /** 用户信息 */
  user: Pick<User.UserInfo, 'id' | 'account' | 'nickname' | 'avatar' | 'personalStatus'>
  /** 是否显示为链接 */
  asLink?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asLink: true
})

/** 显示名称：昵称 > 账号 */
const displayName = computed(() => props.user.nickname || props.user.account)

/** 用户主页链接 */
const userProfileLink = computed(() => `/user/${props.user.id}`)
</script>

<template>
  <UPopover mode="hover" :delay="200">
    <div class="inline-flex cursor-pointer items-center gap-2">
      <UAvatar :src="user.avatar || undefined" :alt="displayName" size="xs" />
      <component
        :is="asLink ? 'a' : 'span'"
        :href="asLink ? userProfileLink : undefined"
        class="text-sm font-medium hover:underline"
        :class="asLink ? 'text-primary-600 dark:text-primary-400' : ''"
      >
        {{ displayName }}
      </component>
    </div>

    <template #content>
      <UCard class="w-72">
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <UAvatar :src="user.avatar || undefined" :alt="displayName" size="lg" />
            <div class="flex-1 space-y-1">
              <h3 class="font-semibold text-gray-900 dark:text-white">
                {{ displayName }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ user.account }}</p>
            </div>
          </div>

          <p
            v-if="user.personalStatus"
            class="line-clamp-2 text-sm text-gray-600 dark:text-gray-300"
          >
            {{ user.personalStatus }}
          </p>

          <UButton
            v-if="asLink"
            :to="userProfileLink"
            variant="outline"
            color="neutral"
            size="sm"
            block
          >
            查看主页
          </UButton>
        </div>
      </UCard>
    </template>
  </UPopover>
</template>
