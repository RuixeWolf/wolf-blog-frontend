<script lang="ts" setup>
import { z } from 'zod'
import { register, sendEmailRegisterCode } from '@/apis/user'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()
const currentUser = useCurrentUser()

// 定义验证 schema
const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, '用户名至少3个字符')
      .regex(/^[a-zA-Z0-9]+$/, '用户名只能包含字母和数字'),
    email: z.email('请输入有效的邮箱地址'),
    emailVerifyCode: z.string().min(1, '请输入邮箱验证码'),
    password: z.string().min(1, '请输入密码').min(6, '密码至少6个字符'),
    confirmPassword: z.string().min(1, '请确认密码')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword']
  })

// 从 schema 推断类型
type RegisterForm = z.output<typeof registerSchema>

// SEO
useHead({
  title: '注册 - Wolf Blog',
  meta: [{ name: 'description', content: '注册 Wolf Blog 账户，开启您的创作之旅' }]
})

if (import.meta.client && currentUser.isLoggedIn) {
  navigateTo('/', { replace: true })
}

/** 注册表单数据 */
const registerForm = ref<RegisterForm>({
  username: '',
  email: '',
  emailVerifyCode: '',
  password: '',
  confirmPassword: ''
})

/** 注册加载状态 */
const isLoading = ref(false)

/** 验证码倒计时状态 */
const countdown = ref(0)
const isSendingCode = ref(false)

/** 获取验证码 */
async function sendVerificationCode(): Promise<void> {
  if (!registerForm.value.email) {
    toast.add({
      title: '请输入邮箱',
      description: '请先输入邮箱地址',
      color: 'warning'
    })
    return
  }

  if (countdown.value > 0) return

  isSendingCode.value = true
  try {
    await sendEmailRegisterCode(registerForm.value.email)
    toast.add({
      title: '验证码已发送',
      description: '请检查您的邮箱',
      color: 'success'
    })
    countdown.value = 60 // 60秒倒计时
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    if (error instanceof ApiError) {
      const { code, message } = error
      toast.add({
        title: '发送失败',
        description: `${message} (${code})`,
        color: 'error'
      })
    } else {
      console.error('发送验证码失败', error)
      toast.add({
        title: '发送失败',
        description: '网络错误，请稍后重试',
        color: 'error'
      })
    }
  } finally {
    isSendingCode.value = false
  }
}

/** 处理注册 */
async function handleSubmit(event: FormSubmitEvent<RegisterForm>): Promise<void> {
  isLoading.value = true
  try {
    const { confirmPassword, ...registerData } = event.data
    await register(registerData)
    toast.add({
      title: '注册成功',
      description: '欢迎加入 Wolf Blog！',
      color: 'success'
    })
    navigateTo('/user/login', { replace: true })
  } catch (error) {
    if (error instanceof ApiError) {
      const { code, message } = error
      toast.add({
        title: '注册失败',
        description: `${message} (${code})`,
        color: 'error'
      })
    } else {
      console.error('注册失败', error)
      toast.add({
        title: '注册失败',
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
  <div class="flex min-h-[calc(100vh-var(--ui-header-height))]">
    <!-- 左侧背景装饰区域 -->
    <div
      class="from-primary-500 to-primary-600 relative hidden flex-col items-center justify-center overflow-hidden bg-linear-to-br lg:flex lg:w-1/2"
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
              <UIcon name="i-heroicons-user-plus" class="h-10 w-10" />
            </div>
          </div>

          <!-- 欢迎文本 -->
          <h1 class="mb-4 text-4xl font-bold">加入我们</h1>
          <p class="text-xl leading-relaxed text-white/90">创建您的账户，开启精彩的创作之旅</p>

          <!-- 装饰性引用 -->
          <div class="mt-12 rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <blockquote class="text-lg italic">"每一次注册都是新旅程的起点"</blockquote>
            <cite class="mt-2 block text-sm text-white/70">- Wolf Blog</cite>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧注册表单区域 -->
    <div class="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <!-- 移动端 Logo -->
        <div class="mb-8 text-center lg:hidden">
          <div class="inline-flex items-center gap-3">
            <div class="bg-primary-500 flex h-12 w-12 items-center justify-center rounded-full">
              <UIcon name="i-heroicons-pencil" class="h-6 w-6 text-white" />
            </div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Wolf Blog</h1>
          </div>
        </div>

        <!-- 注册卡片 -->
        <UCard
          class="fade-in-up border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-900/80"
        >
          <template #header>
            <div class="text-center">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">创建新账户</h2>
            </div>
          </template>

          <!-- 注册表单 -->
          <UForm
            :state="registerForm"
            :schema="registerSchema"
            class="space-y-6"
            :disabled="isLoading"
            @submit="handleSubmit"
          >
            <!-- 用户名 -->
            <UFormField label="用户名" name="username" required class="px-4">
              <UInput
                v-model="registerForm.username"
                placeholder="请输入用户名"
                icon="i-heroicons-user"
                size="lg"
                class="w-full"
                :disabled="isLoading"
              />
            </UFormField>

            <!-- 邮箱 -->
            <UFormField label="邮箱" name="email" required class="px-4">
              <UInput
                v-model="registerForm.email"
                type="email"
                placeholder="请输入邮箱地址"
                icon="i-heroicons-envelope"
                size="lg"
                class="w-full"
                :disabled="isLoading"
              />
            </UFormField>

            <!-- 邮箱验证码 -->
            <UFormField label="邮箱验证码" name="emailVerifyCode" required class="px-4">
              <div class="flex gap-3">
                <UInput
                  v-model="registerForm.emailVerifyCode"
                  placeholder="请输入验证码"
                  icon="i-heroicons-shield-check"
                  size="lg"
                  class="flex-1"
                  :disabled="isLoading"
                />
                <UButton
                  type="button"
                  size="lg"
                  variant="outline"
                  :disabled="!registerForm.email || countdown > 0 || isSendingCode || isLoading"
                  :loading="isSendingCode"
                  @click="sendVerificationCode"
                >
                  {{ countdown > 0 ? `${countdown}s` : isSendingCode ? '发送中' : '获取验证码' }}
                </UButton>
              </div>
            </UFormField>

            <!-- 密码 -->
            <UFormField label="密码" name="password" required class="px-4">
              <UInput
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                icon="i-heroicons-lock-closed"
                size="lg"
                class="w-full"
                :disabled="isLoading"
              />
            </UFormField>

            <!-- 确认密码 -->
            <UFormField label="确认密码" name="confirmPassword" required class="px-4">
              <UInput
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                icon="i-heroicons-lock-closed"
                size="lg"
                class="w-full"
                :disabled="isLoading"
              />
            </UFormField>

            <!-- 注册按钮 -->
            <UButton
              type="submit"
              size="lg"
              class="btn-register w-full justify-center"
              :loading="isLoading"
              :disabled="isLoading"
            >
              {{ isLoading ? '注册中...' : '创建账户' }}
            </UButton>
          </UForm>

          <template #footer>
            <div class="text-center text-gray-600 dark:text-gray-400">
              已有账户？
              <UButton to="/user/login" variant="link" color="primary" class="font-semibold">
                立即登录
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

/* 注册按钮悬停效果 */
:deep(.btn-register:hover) {
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
