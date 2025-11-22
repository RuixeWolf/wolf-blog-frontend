<script lang="ts" setup>
/** 颜色模式 */
const colorMode = useColorMode()
</script>

<template>
  <div class="bg-default space-y-6 rounded-lg p-5 shadow-lg md:p-8">
    <div class="border-b border-gray-200 pb-4 dark:border-gray-800">
      <h2 class="text-xl font-semibold">外观主题</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">自定义 Wolf Blog 的外观显示</p>
    </div>

    <div class="space-y-4">
      <h3 class="text-base font-medium">主题模式</h3>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <!-- 跟随系统 -->
        <div
          class="hover:border-primary-500 bg-default cursor-pointer rounded-lg border-2 p-4 transition-all"
          :class="[
            colorMode.preference === 'system'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
              : 'border-gray-200 dark:border-gray-800'
          ]"
          @click="colorMode.preference = 'system'"
        >
          <div
            class="mb-3 flex h-24 items-center justify-center rounded bg-gray-100 dark:bg-gray-800"
          >
            <UIcon name="i-lucide-monitor" class="h-10 w-10 text-gray-500" />
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">跟随系统</span>
            <UIcon
              v-if="colorMode.preference === 'system'"
              name="i-lucide-check-circle-2"
              class="text-primary-500"
            />
          </div>
        </div>

        <!-- 浅色模式 -->
        <div
          class="hover:border-primary-500 bg-default cursor-pointer rounded-lg border-2 p-4 transition-all"
          :class="[
            colorMode.preference === 'light'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
              : 'border-gray-200 dark:border-gray-800'
          ]"
          @click="colorMode.preference = 'light'"
        >
          <div
            class="mb-3 flex h-24 items-center justify-center rounded border border-gray-200 bg-white"
          >
            <UIcon name="i-lucide-sun" class="h-10 w-10 text-orange-500" />
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">浅色模式</span>
            <UIcon
              v-if="colorMode.preference === 'light'"
              name="i-lucide-check-circle-2"
              class="text-primary-500"
            />
          </div>
        </div>

        <!-- 深色模式 -->
        <div
          class="hover:border-primary-500 bg-default cursor-pointer rounded-lg border-2 p-4 transition-all"
          :class="[
            colorMode.preference === 'dark'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
              : 'border-gray-200 dark:border-gray-800'
          ]"
          @click="colorMode.preference = 'dark'"
        >
          <div
            class="mb-3 flex h-24 items-center justify-center rounded border border-gray-700 bg-gray-900"
          >
            <UIcon name="i-lucide-moon" class="h-10 w-10 text-blue-400" />
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">深色模式</span>
            <UIcon
              v-if="colorMode.preference === 'dark'"
              name="i-lucide-check-circle-2"
              class="text-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
