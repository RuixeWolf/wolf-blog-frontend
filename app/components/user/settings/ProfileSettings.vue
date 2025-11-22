<script lang="ts" setup>
import { updateUserProfile, uploadAvatar } from '~/apis/user'
import { CircleStencil, Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import type { CalendarDate } from '@internationalized/date'
import { DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'

/** Nuxt UI 的消息提示 */
const toast = useToast()

/** 当前登录用户状态 */
const currentUser = useCurrentUser()

/** 支持编辑的资料字段列表 */
const profileFields = ['avatar', 'nickname', 'personalStatus', 'email', 'phone', 'birth'] as const

type ProfileFieldKey = (typeof profileFields)[number]

/**
 * 用户资料表单数据，使用字符串存储，便于与输入控件双向绑定。
 */
const formState = reactive<Record<ProfileFieldKey, string>>({
  avatar: '',
  nickname: '',
  personalStatus: '',
  email: '',
  phone: '',
  birth: ''
})

/**
 * 记录用户资料的初始状态，用于判断是否有改动。
 */
const initialState = ref<Record<ProfileFieldKey, string | null>>({
  avatar: null,
  nickname: null,
  personalStatus: null,
  email: null,
  phone: null,
  birth: null
})

/** 表单提交加载状态 */
const saving = ref(false)

/**
 * 判断当前是否已登录。
 */
const isLoggedIn = computed(() => currentUser.isLoggedIn)

/**
 * 当前用户信息引用，便于监听变化。
 */
const userInfo = computed(() => currentUser.userInfo)

/**
 * 将可空字符串转换为输入框使用的值。
 */
function toInputValue(value: string | null | undefined): string {
  return value ?? ''
}

/**
 * 将表单输入值规范化：去除首尾空白，空字符串视为 null。
 */
function normalizeFieldValue(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * 根据当前用户信息填充表单，并记录初始快照。
 */
function applyUserInfoSnapshot(user: User.UserInfo | null) {
  profileFields.forEach((key) => {
    const rawValue = user?.[key as keyof User.UserInfo]
    if (typeof rawValue === 'string' || rawValue === null || rawValue === undefined) {
      formState[key] = toInputValue(rawValue)
      initialState.value[key] = rawValue ?? null
    }
  })
}

/**
 * 监听用户信息变化，初始化或刷新表单内容。
 */
watch(
  userInfo,
  (user) => {
    applyUserInfoSnapshot(user ?? null)
  },
  { immediate: true }
)

/**
 * 计算当前表单的规范化结果，便于比较和构建请求负载。
 */
const normalizedFormState = computed<Record<ProfileFieldKey, string | null>>(() => {
  const result = {} as Record<ProfileFieldKey, string | null>
  profileFields.forEach((key) => {
    result[key] = normalizeFieldValue(formState[key])
  })
  return result
})

/**
 * 是否存在未保存的更改。
 */
const hasUnsavedChanges = computed(() =>
  profileFields.some((key) => normalizedFormState.value[key] !== initialState.value[key])
)

/**
 * 构建包含所有字段的更新请求体，未填写的值传递为 null。
 */
function buildUpdatePayload(): User.UpdateProfileRequest {
  const payload: User.UpdateProfileRequest = {}
  profileFields.forEach((key) => {
    let value = normalizedFormState.value[key] ?? null
    // 特殊处理：如果是本地预览的 Blob URL，则发送 'true' 以应用上传的头像
    if (key === 'avatar' && value?.startsWith('blob:')) {
      value = 'true'
    }
    payload[key] = value
  })
  return payload
}

/**
 * 将表单重置为初始状态。
 */
function handleResetForm() {
  profileFields.forEach((key) => {
    formState[key] = toInputValue(initialState.value[key])
  })
}

/**
 * 提交用户资料更新。
 */
async function handleSubmit() {
  if (!isLoggedIn.value) {
    toast.add({
      title: '请先登录',
      description: '登录后即可更新个人资料。',
      color: 'warning'
    })
    return
  }

  if (!hasUnsavedChanges.value) {
    toast.add({
      title: '未检测到修改',
      description: '请先调整需要更新的资料再保存。',
      color: 'neutral'
    })
    return
  }

  try {
    saving.value = true
    const payload = buildUpdatePayload()
    const updatedUser = await updateUserProfile(payload)
    toast.add({
      title: '资料已更新',
      description: '个人资料保存成功。',
      color: 'success'
    })
    // 同步 Pinia 仓库中的用户信息
    currentUser.userInfo = updatedUser
    applyUserInfoSnapshot(updatedUser)
  } catch (error) {
    console.error('更新用户资料失败', error)
    toast.add({
      title: '保存失败',
      description: error instanceof Error ? error.message : '请稍后再试',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

/**
 * 若用户已登录但资料尚未加载完成，则显示加载状态。
 */
const pendingUserInfo = computed(() => isLoggedIn.value && !userInfo.value)

/** 头像裁剪相关状态 */
const isCropModalOpen = ref(false)
const cropImageSrc = ref<string | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cropperRef = ref<any>(null)
const isUploadingAvatar = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

/** 日期格式化 */
const df = new DateFormatter('zh-CN', {
  dateStyle: 'medium'
})

/** 出生日期绑定模型 */
const birthDateModel = computed({
  get: () => {
    if (!formState.birth) return undefined
    try {
      return parseDate(formState.birth)
    } catch {
      return undefined
    }
  },
  set: (val: CalendarDate | undefined) => {
    formState.birth = val ? val.toString() : ''
  }
})

/** 选择文件 */
function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    // 简单的类型检查
    if (!file.type.startsWith('image/')) {
      toast.add({ title: '仅支持图片文件', color: 'warning' })
      return
    }
    cropImageSrc.value = URL.createObjectURL(file)
    isCropModalOpen.value = true
    input.value = '' // 重置，允许重复选择同一文件
  }
}

/** 确认裁剪并上传 */
async function onConfirmCrop() {
  if (!cropperRef.value) return

  const { canvas } = cropperRef.value.getResult()
  if (canvas) {
    canvas.toBlob(async (blob: Blob | null) => {
      if (!blob) return

      const file = new File([blob], 'avatar.png', { type: 'image/png' })

      try {
        isUploadingAvatar.value = true
        await uploadAvatar(file)
        toast.add({ title: '头像已上传', description: '请点击保存以应用更改', color: 'success' })
        isCropModalOpen.value = false

        // 生成本地预览 URL
        const previewUrl = URL.createObjectURL(blob)
        formState.avatar = previewUrl
      } catch (error) {
        console.error('头像上传失败', error)
        toast.add({
          title: '头像上传失败',
          description: error instanceof Error ? error.message : '请稍后再试',
          color: 'error'
        })
      } finally {
        isUploadingAvatar.value = false
      }
    }, 'image/png')
  }
}

/** 关闭裁剪弹窗 */
function onCloseCropModal() {
  isCropModalOpen.value = false
  if (cropImageSrc.value) {
    URL.revokeObjectURL(cropImageSrc.value)
    cropImageSrc.value = null
  }
}

/** 撤销头像修改 */
function handleUndoAvatar() {
  if (formState.avatar?.startsWith('blob:')) {
    URL.revokeObjectURL(formState.avatar)
  }
  formState.avatar = toInputValue(initialState.value.avatar)
}

onMounted(() => {
  if (isLoggedIn.value && !userInfo.value) {
    void currentUser.refreshUserInfo()
  }
})
</script>

<template>
  <div class="bg-default space-y-6 rounded-lg p-5 shadow-lg md:p-8">
    <div class="border-b border-gray-200 pb-4 dark:border-gray-800">
      <h2 class="text-xl font-semibold">个人资料</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">更新昵称、头像与个性签名等信息</p>
    </div>

    <div v-if="pendingUserInfo" class="space-y-4">
      <USkeleton class="h-12 w-3/4" />
      <USkeleton class="h-32 w-full" />
      <USkeleton class="h-12 w-1/2" />
    </div>

    <div v-else class="flex flex-col-reverse gap-10 md:flex-row">
      <!-- 左侧：表单区域 -->
      <div class="flex-1 space-y-6">
        <UFormField label="昵称" name="nickname">
          <UInput v-model="formState.nickname" class="w-full md:w-100" placeholder="请输入昵称" />
        </UFormField>

        <UFormField label="个性签名" name="personalStatus" description="最多 60 个字符">
          <UTextarea
            v-model="formState.personalStatus"
            class="w-full md:w-100"
            :rows="3"
            placeholder="写点什么介绍自己吧"
          />
        </UFormField>

        <UFormField label="电子邮箱" name="email" description="用于找回密码和接收通知">
          <UInput
            v-model="formState.email"
            class="w-full md:w-100"
            placeholder="your@email.com"
            type="email"
          />
        </UFormField>

        <UFormField label="联系手机号" name="phone" description="仅自己可见">
          <UInput v-model="formState.phone" class="w-full md:w-100" placeholder="请输入手机号" />
        </UFormField>

        <UFormField label="出生日期" name="birth">
          <UPopover>
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-calendar"
              class="w-full justify-start md:w-100"
            >
              {{
                birthDateModel ? df.format(birthDateModel.toDate(getLocalTimeZone())) : '选择日期'
              }}
            </UButton>

            <template #content>
              <UCalendar v-model="birthDateModel" class="p-2" />
            </template>
          </UPopover>
        </UFormField>

        <div class="border-t border-gray-100 pt-4 dark:border-gray-800">
          <h3 class="mb-4 text-sm font-medium text-gray-500">账户信息 (只读)</h3>
          <div class="space-y-4">
            <UFormField label="账号" name="account">
              <UInput class="w-full md:w-100" :model-value="userInfo?.account ?? ''" disabled />
            </UFormField>
            <UFormField label="用户名" name="username">
              <UInput class="w-full md:w-100" :model-value="userInfo?.username ?? ''" disabled />
            </UFormField>
            <UFormField label="注册时间" name="registerDate">
              <UInput
                class="w-full md:w-100"
                :model-value="userInfo?.registerDate ?? ''"
                disabled
              />
            </UFormField>
          </div>
        </div>

        <div class="flex items-center gap-3 pt-3">
          <UButton
            icon="i-lucide-save"
            color="primary"
            :loading="saving"
            :disabled="!hasUnsavedChanges"
            @click="handleSubmit"
          >
            保存资料
          </UButton>
          <UButton
            variant="ghost"
            color="neutral"
            :disabled="!hasUnsavedChanges"
            @click="handleResetForm"
          >
            重置
          </UButton>
        </div>
      </div>

      <!-- 右侧：头像区域 -->
      <div class="w-48 shrink-0 self-center md:self-start">
        <div class="space-y-3">
          <div class="group relative">
            <UAvatar
              :src="formState.avatar || undefined"
              :alt="formState.nickname || 'Avatar'"
              size="3xl"
              class="aspect-square h-auto w-full rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-800"
            />
            <input
              ref="fileInputRef"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              class="hidden"
              @change="onFileSelect"
            />
          </div>

          <div class="flex flex-col gap-2">
            <UButton
              block
              icon="i-lucide-camera"
              color="neutral"
              variant="outline"
              size="sm"
              @click="fileInputRef?.click()"
            >
              更换头像
            </UButton>
            <UButton
              v-if="formState.avatar?.startsWith('blob:')"
              block
              icon="i-lucide-rotate-ccw"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="handleUndoAvatar"
            >
              撤销修改
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 头像裁剪弹窗 -->
    <UModal v-model:open="isCropModalOpen" prevent-close title="裁剪头像">
      <template #body>
        <div class="flex justify-center bg-gray-50 p-4 dark:bg-gray-900">
          <Cropper
            ref="cropperRef"
            class="h-[300px] w-full max-w-[400px]"
            :src="cropImageSrc"
            :stencil-component="CircleStencil"
            :stencil-props="{ aspectRatio: 1 / 1 }"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex w-full items-center justify-center gap-2">
          <UButton color="neutral" variant="ghost" @click="onCloseCropModal">取消</UButton>
          <UButton :loading="isUploadingAvatar" @click="onConfirmCrop">确认并上传</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
