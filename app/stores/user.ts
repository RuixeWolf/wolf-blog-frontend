import { defineStore } from 'pinia'
import * as userApi from '@/apis/user'

/** 当前登录用户仓库 */
export const useCurrentUser = defineStore('current-user', () => {
  /** 用户登录 token */
  const authToken = useCookie('auth_token')

  /** 当前登录用户信息 */
  const userInfo = ref<User.UserInfo | null>(null)

  /** 是否已登录 */
  const isLoggedIn = computed(() => Boolean(authToken.value && userInfo.value))

  /** 用户登录 */
  async function login(data: User.LoginRequest) {
    const res = await userApi.login(data)
    if (!res.token) throw new Error('登录失败，未获取到访问令牌')
    authToken.value = res.token
    // 登录成功后刷新用户信息
    await nextTick()
    await refreshUserInfo()
  }

  /** 清空用户登录信息 */
  function clearUserInfo() {
    authToken.value = null
    userInfo.value = null
  }

  /** 用户退出登录 */
  async function logout() {
    clearUserInfo()
  }

  /** 刷新当前登录用户信息 */
  async function refreshUserInfo() {
    if (!authToken.value) {
      userInfo.value = null
      return
    }

    try {
      userInfo.value = await userApi.getUserInfo()
    } catch (error) {
      // 如果获取用户信息失败，清除认证状态
      authToken.value = null
      userInfo.value = null
      if (error instanceof ApiError) {
        const { code, message } = error
        console.error(`获取用户信息失败，错误码：${code}，错误信息：${message}`)
        return
      }
      console.error('获取用户信息失败', error)
    }
  }

  /** 初始化用户状态 */
  async function initializeUser() {
    // 只在客户端初始化，避免 SSR 期间的网络请求
    if (import.meta.client && authToken.value) {
      await refreshUserInfo()
    }
  }

  // 在客户端挂载后初始化用户状态
  if (import.meta.client) {
    // 使用 nextTick 确保在组件挂载后执行
    nextTick(() => void initializeUser())
  }

  return {
    isLoggedIn,
    login,
    logout,
    clearUserInfo,
    userInfo,
    refreshUserInfo,
    initializeUser
  }
})
