import { ApiError } from '../../shared/types/ApiError'
import { filterUndefinedFields, optionalField } from '../../shared/utils/data-process'

/** 用户登录 */
export async function login(data: User.LoginRequest): Promise<User.LoginResponse> {
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

/** 更新当前用户资料 */
export async function updateUserProfile(data: User.UpdateProfileRequest): Promise<User.UserInfo> {
  const { $api } = useNuxtApp()
  const body = filterUndefinedFields({
    avatar: optionalField(data.avatar, String),
    personalStatus: optionalField(data.personalStatus, String),
    nickname: optionalField(data.nickname, String),
    phone: optionalField(data.phone, String),
    email: optionalField(data.email, String),
    birth: optionalField(data.birth, String)
  })
  const response = await $api<ApiResponse<User.UserInfo>>('/user', {
    method: 'PUT',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 关注指定用户 */
export async function subscribeUser(data: User.SubscribeRequest): Promise<void> {
  const { $api } = useNuxtApp()
  const body = filterUndefinedFields({
    fromUser: optionalField(data.fromUser, Number),
    toUser: Number(data.toUser)
  })
  const response = await $api<ApiResponse<void>>('/user/subscribe', {
    method: 'PUT',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 取消关注指定用户 */
export async function unsubscribeUser(data: User.SubscribeRequest): Promise<void> {
  const { $api } = useNuxtApp()
  const body = filterUndefinedFields({
    fromUser: optionalField(data.fromUser, Number),
    toUser: Number(data.toUser)
  })
  const response = await $api<ApiResponse<void>>('/user/subscribe', {
    method: 'DELETE',
    body
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 获取关注列表 */
export async function getUserSubscriptions(
  query: User.SubscriptionListQuery = {}
): Promise<ApiPageData<User.SubscriptionListItem>> {
  const { $api } = useNuxtApp()
  const body = filterUndefinedFields({
    fromUser: optionalField(query.fromUser, Number),
    pageNumber: optionalField(query.pageNumber, Number),
    pageSize: optionalField(query.pageSize, Number)
  })
  const response = await $api<ApiResponse<ApiPageData<User.SubscriptionListItem>>>(
    '/user/subscribe',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/nullable+json' },
      body
    }
  )
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 删除当前账号 */
export async function deleteCurrentUser(): Promise<void> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<void>>('/user', {
    method: 'DELETE'
  })
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 根据用户名关键字查询用户 */
export async function searchUsersByName(name: string): Promise<User.UserInfo[]> {
  const { $api } = useNuxtApp()
  const response = await $api<ApiResponse<User.UserInfo[]>>(`/user/n/${encodeURIComponent(name)}`)
  if (!response.success) throw new ApiError(response)
  return response.data
}

/** 根据 ID 列表获取用户简略信息 */
export async function getUsersBriefByIds(
  ids: User.BriefBatchQuery['ids']
): Promise<User.UserBrief[]> {
  const { $api } = useNuxtApp()
  if (!Array.isArray(ids) || ids.length === 0) return []
  const searchParams = new URLSearchParams()
  ids.forEach((id) => {
    searchParams.append('ids', String(id))
  })
  const response = await $api<ApiResponse<User.UserBrief[]>>(
    `/user/brief${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  )
  if (!response.success) throw new ApiError(response)
  return response.data
}
