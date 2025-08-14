import { defineStore } from 'pinia'

/** 用户登录 token */
const authToken = useCookie('auth_token', {
  default: () => '',
  secure: true,
  sameSite: 'strict'
})

/** 当前登录用户仓库 */
export const useCurrentUser = defineStore('current-user', () => {
  /** 是否已登录 */
  const isLoggedIn = ref(false)

  return {
    isLoggedIn
  }
})
