/** 用户登录 */
export async function login(data: User.LoginRequest): Promise<User.LoginResponse> {
  const { $api } = useNuxtApp()
  const body = {
    account: String(data.account),
    password: String(data.password)
  }
  console.log('用户登录请求体:', body)
  const response = await $api<ApiResponse<User.LoginResponse>>('/user/login', {
    method: 'POST',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 用户注册 */
export async function register(data: User.RegisterRequest): Promise<User.RegisterResponse> {
  const { $api } = useNuxtApp()
  const body = {
    username: String(data.username),
    email: String(data.email),
    password: String(data.password)
  }
  const response = await $api<ApiResponse<User.RegisterResponse>>('/user/register', {
    method: 'POST',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/**
 * 获取用户信息
 * @param userId - 可选的用户 ID，若未提供则获取当前登录用户信息
 */
export async function getUserInfo(userId?: User.UserInfo['id']): Promise<User.UserInfo> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<User.UserInfo>>(userId ? `/user/${userId}` : '/user', {
    method: 'GET'
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}
