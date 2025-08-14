import { ApiError } from '~/utils/api-util'

/** 用户登录 */
export async function login(data: {
  /** 账号或邮箱 */
  account: string
  /** 密码 */
  password: string
}): Promise<User.LoginResponse> {
  const { $api } = useNuxtApp()
  const body = {
    account: String(data.account),
    password: String(data.password)
  }
  const response = await $api<ApiResponse<User.LoginResponse>>('/user/login', {
    method: 'POST',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 用户注册 */
export async function register(data: {
  /** 用户 ID */
  userId?: string
  /** 用户名 */
  username: string
  /** 邮箱 */
  email: string
  /** 密码 */
  password: string
}): Promise<User.RegisterResponse> {
  const body = {
    userId: String(data.userId),
    username: String(data.username),
    email: String(data.email),
    password: String(data.password)
  }
  const response = await $fetch<ApiResponse<User.RegisterResponse>>('/user/register', {
    method: 'POST',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}
