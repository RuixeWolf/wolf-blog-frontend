/** 用户相关类型定义 */
declare namespace User {
  /** 用户信息 */
  interface UserInfo {
    /** 用户 ID */
    id: number
    /** 用户名 */
    username: string
    /** 用户昵称/显示名称 */
    nickname: string
    /** 用户账号 */
    account: string
    /** 用户头像URL */
    avatar: string
    /** 个人状态/签名 */
    personalStatus: string
    /** 手机号码 */
    phone: string
    /** 邮箱地址 */
    email: string
    /** 出生日期 */
    birth: string
    /** 注册时间 */
    registerDate: string
  }

  /** 登录请求 */
  type LoginRequest = Pick<UserInfo, 'account' | 'password'>

  /** 登录响应 */
  type LoginResponse = {
    /** 访问令牌 */
    token: string
  }

  /** 注册请求 */
  type RegisterRequest = Pick<UserInfo, 'username' | 'email'> & {
    /** 密码 */
    password: string
  }

  /** 注册响应 */
  type RegisterResponse = Pick<UserInfo, 'id' | 'username' | 'account' | 'email'> & {
    /** 访问令牌 */
    token: string
  }

  /** 全量更新用户信息请求 */
  type PutUserRequest = Pick<
    UserInfo,
    'nickname' | 'avatar' | 'personalStatus' | 'phone' | 'email' | 'birth'
  >
}
