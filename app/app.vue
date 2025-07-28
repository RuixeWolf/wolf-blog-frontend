<script setup lang="ts">
import { zh_cn } from '@nuxt/ui/locale'
</script>

<template>
  <UApp :locale="zh_cn">
    <div class="min-h-screen min-w-screen">
      <NuxtPage />
    </div>
  </UApp>
</template>
