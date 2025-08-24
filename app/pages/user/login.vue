<script lang="ts" setup>
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()
const currentUser = useCurrentUser()

// 定义验证 schema
const loginSchema = z.object({
  account: z.string().min(1, '请输入账号').min(3, '账号至少3个字符'),
  password: z.string().min(1, '请输入密码').min(6, '密码至少6个字符')
})

// 从 schema 推断类型
type LoginForm = z.output<typeof loginSchema>

// SEO
useHead({
  title: '登录 - Wolf Blog',
  meta: [{ name: 'description', content: '登录到 Wolf Blog 分享您的想法' }]
})

if (import.meta.client && currentUser.isLoggedIn) {
  navigateTo('/', { replace: true })
}

/** 登录表单数据 */
const loginForm = ref<LoginForm>({
  account: '',
  password: ''
})

/** 登录加载状态 */
const isLoading = ref(false)

/** 处理登录 */
async function handleSubmit(event: FormSubmitEvent<LoginForm>): Promise<void> {
  isLoading.value = true
  try {
    await currentUser.login(event.data)
    toast.add({
      title: '登录成功',
      description: '欢迎回来！',
      color: 'success'
    })
    navigateTo('/', { replace: true })
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
      toast.add({
        title: '登录失败',
        description: '网络错误，请稍后重试',
        color: 'error'
      })
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-full">
    <!-- 左侧背景装饰区域 -->
    <div
      class="from-primary-500 to-primary-600 relative hidden flex-col items-center justify-center overflow-hidden bg-gradient-to-br lg:flex lg:w-1/2"
    >
      <!-- 背景装饰图案 -->
      <div class="absolute inset-0 opacity-20">
        <div class="bg-pattern w-full" />
      </div>

      <!-- 内容区域 -->
      <div class="relative z-10 flex flex-col items-center justify-center p-12 text-white">
        <div class="max-w-md text-center">
          <!-- Logo 或图标 -->
          <div class="mb-8">
            <div
              class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20"
            >
              <Icon name="i-lucide-user-circle" class="h-10 w-10" />
            </div>
          </div>

          <!-- 欢迎文本 -->
          <h1 class="mb-4 text-4xl font-bold">欢迎回来</h1>
          <p class="text-xl leading-relaxed text-white/90">登录您的账户，继续您的精彩旅程</p>

          <!-- 装饰性引用 -->
          <div class="mt-12 rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <blockquote class="text-lg italic">"每一次登录都是新故事的开始"</blockquote>
            <cite class="mt-2 block text-sm text-white/70">- Wolf Blog</cite>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单区域 -->
    <div class="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <!-- 移动端 Logo -->
        <div class="mb-8 text-center lg:hidden">
          <div class="inline-flex items-center gap-3">
            <div class="bg-primary-500 flex h-12 w-12 items-center justify-center rounded-full">
              <Icon name="i-lucide-user-circle" class="h-6 w-6 text-white" />
            </div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Wolf Blog</h1>
          </div>
        </div>

        <!-- 登录卡片 -->
        <UCard
          class="fade-in-up border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-900/80"
        >
          <template #header>
            <div class="text-center">
              <h2 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">用户登录</h2>
            </div>
          </template>

          <!-- 登录表单 -->
          <UForm
            :state="loginForm"
            :schema="loginSchema"
            class="box-border w-full space-y-6 px-6"
            :disabled="isLoading"
            @submit="handleSubmit"
          >
            <UFormField label="账号" name="account" required>
              <UInput
                v-model="loginForm.account"
                class="w-full"
                placeholder="请输入用户名或邮箱"
                size="lg"
                icon="i-lucide-user"
                autocomplete="username"
              />
            </UFormField>

            <UFormField label="密码" name="password" required>
              <UInput
                v-model="loginForm.password"
                class="w-full"
                type="password"
                placeholder="请输入密码"
                size="lg"
                icon="i-lucide-lock"
                autocomplete="current-password"
              />
            </UFormField>

            <!-- 记住我和忘记密码 -->
            <!-- <div class="flex items-center justify-between">
              <UCheckbox label="记住我" />
              <UButton variant="link" size="sm" color="primary" to="/user/forgot-password">
                忘记密码？
              </UButton>
            </div> -->

            <!-- 登录按钮 -->
            <UButton
              type="submit"
              size="lg"
              block
              :loading="isLoading"
              :disabled="isLoading"
              class="btn-login font-semibold"
              >登录
            </UButton>
          </UForm>

          <template #footer>
            <!-- 注册链接 -->
            <div class="text-center">
              <span class="text-gray-600 dark:text-gray-400">还没有账户？</span>
              <UButton
                variant="link"
                color="primary"
                to="/user/register"
                class="ml-1 font-semibold"
              >
                立即注册
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bg-pattern {
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.1) 2px, transparent 2px);
  background-size: 30px 30px;
}

/* 增强卡片阴影效果 */
:deep(.shadow-xl) {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* 美化输入框获焦状态 */
:deep(.form-input:focus) {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

/* 登录按钮悬停效果 */
:deep(.btn-login:hover) {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* 响应式调整 */
@media (max-width: 1023px) {
  .min-h-screen {
    min-height: 100vh;
    background: linear-gradient(135deg, rgb(56 189 248) 0%, rgb(59 130 246) 100%);
  }
}

/* 美化加载状态 */
:deep(.animate-spin) {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 卡片进入动画 */
.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 40px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
</style>
