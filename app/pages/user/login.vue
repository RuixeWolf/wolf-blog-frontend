<script lang="ts" setup>
import { UButton, UForm, UFormField } from '#components'

const toast = useToast()

/** 当前登录用户 */
const currentUser = useCurrentUser()

// 如果用户已登录则跳转至首页
if (import.meta.client && currentUser.isLoggedIn) {
  navigateTo('/')
}

/** 用户登录表单 */
const loginForm = ref({
  account: '',
  password: ''
})

/** 处理用户登录 */
async function handleLogin(): Promise<void> {
  console.log('登录表单数据:', loginForm.value)
  try {
    await currentUser.login(loginForm.value)
    toast.add({
      title: '登录成功',
      color: 'success'
    })
    navigateTo('/')
  } catch (error) {
    if (error instanceof ApiError) {
      const { code, message } = error

      toast.add({
        title: '登录失败',
        description: `${message} (${code})`,
        color: 'error'
      })
    } else {
      console.error('登录失败', error)
    }
  }
}
</script>

<template>
  <div>
    <UForm :state="loginForm" @submit="handleLogin">
      <UFormField label="账号" name="account">
        <UInput v-model="loginForm.account" />
      </UFormField>

      <UFormField label="密码" name="password">
        <UInput v-model="loginForm.password" type="password" />
      </UFormField>

      <UButton type="submit"> 登录 </UButton>
    </UForm>
  </div>
</template>

<style lang="scss" scoped></style>
