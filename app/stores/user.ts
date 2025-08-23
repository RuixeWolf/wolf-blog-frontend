import { defineStore } from 'pinia'
import * as userApi from '@/apis/user'

/** 当前登录用户仓库 */
export const useCurrentUser = defineStore('current-user', () => {
  /** 用户登录 token */
  const authToken = useCookie('auth_token')

  /** 是否已登录 */
  const isLoggedIn = ref(Boolean(authToken.value))

  /** 用户登录 */
  async function login(data: User.LoginRequest) {
    console.log('用户登录:', data)
    const res = await userApi.login(data)
    if (!res.token) throw new Error('登录失败，未获取到访问令牌')
    authToken.value = res.token
    isLoggedIn.value = true
    // 登录成功后刷新用户信息
    await refreshUserInfo()
  }

  /** 用户退出登录 */
  async function logout() {
    authToken.value = null
    isLoggedIn.value = false
  }

  /** 当前登录用户信息 */
  const userInfo = ref<User.UserInfo | null>(null)

  /** 刷新当前登录用户信息 */
  async function refreshUserInfo() {
    if (!isLoggedIn.value) return
    try {
      userInfo.value = await userApi.getUserInfo()
    } catch (error) {
      isLoggedIn.value = false
      if (error instanceof ApiError) {
        const { code, message } = error
        console.error(`获取用户信息失败，错误码：${code}，错误信息：${message}`)
        return
      }
      console.error('获取用户信息失败', error)
    }
  }
  void refreshUserInfo()

  return {
    isLoggedIn,
    login,
    logout,
    userInfo,
    refreshUserInfo
  }
})
