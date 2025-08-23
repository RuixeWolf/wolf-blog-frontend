<script lang="ts" setup>
function hello(name: string) {
  console.log(`Hello, ${name}!`)
}
</script>

<template>
  <div class="p-10 text-center">
    <h1>Welcome to Wolf Blog Today's question is, what to eat?</h1>
    <UButton class="mt-5" color="primary" @click="hello('Nuxt UI Test')">Nuxt UI Test</UButton>
  </div>
</template>

<style></style>
