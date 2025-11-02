/** 用户相关类型定义 */
declare namespace User {
  /** 用户信息 */
  interface UserInfo {
    /** 用户 ID */
    id: number
    /** 用户名 */
    username: string
    /** 用户昵称/显示名称 */
    nickname: string | null
    /** 用户账号 */
    account: string
    /** 用户头像URL */
    avatar: string | null
    /** 个人状态/签名 */
    personalStatus: string | null
    /** 手机号码 */
    phone: string | null
    /** 邮箱地址 */
    email: string | null
    /** 出生日期 */
    birth: string | null
    /** 注册时间 */
    registerDate: string
  }

  /** 用户简略信息 */
  interface UserBrief {
    /** 用户 ID */
    id: number
    /** 用户账号 */
    account: string
    /** 显示昵称 */
    nickname: string | null
    /** 头像地址 */
    avatar: string | null
    /** 个性签名 */
    personalStatus: string | null
  }

  /** 登录请求 */
  interface LoginRequest {
    /** 登录账号或邮箱 */
    account: string
    /** 登录密码 */
    password: string
  }

  /** 登录响应 */
  interface LoginResponse {
    /** 访问令牌 */
    token: string
  }

  /** 注册请求 */
  interface RegisterRequest {
    /** 用户名（唯一） */
    username: string
    /** 用户邮箱 */
    email: string
    /** 登录密码 */
    password: string
    /** 邮箱验证码 */
    emailVerifyCode: string
  }

  /** 注册响应 */
  type RegisterResponse = Pick<UserInfo, 'id' | 'username' | 'account' | 'email'> & {
    /** 访问令牌 */
    token: string
  }

  /** 用户资料更新请求 */
  type UpdateProfileRequest = Partial<
    Pick<UserInfo, 'avatar' | 'personalStatus' | 'nickname' | 'phone' | 'email' | 'birth'>
  >

  /** 关注/取关请求 */
  interface SubscribeRequest {
    /** 发起关注的用户 ID，留空则为当前登录用户 */
    fromUser?: number | null
    /** 要关注/取关的目标用户 ID */
    toUser: number
  }

  /** 关注列表查询请求 */
  type SubscriptionListQuery = Partial<ApiPageRequest> & {
    /** 要查询的用户 ID，若为空则为当前登录用户 */
    fromUser?: number | null
  }

  /** 关注列表单项 */
  type SubscriptionListItem = UserBrief

  /** 批量获取用户简略信息的查询参数 */
  interface BriefBatchQuery {
    /** 用户 ID 列表 */
    ids: Array<UserBrief['id']>
  }
}
