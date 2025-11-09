/** 阿里云验证码全局类型声明 */

/** 阿里云验证码配置 */
interface AliyunCaptchaConfig {
  region: string
  prefix: string
}

/** 阿里云验证码初始化选项 */
interface AliyunCaptchaOptions {
  /** 场景 ID */
  SceneId: string
  /** 验证码模式 */
  mode: 'popup' | 'inline'
  /** 页面上预留的渲染验证码的元素 */
  element: string
  /** 触发验证码弹窗的元素 */
  button: string
  /** 验证成功回调 */
  success: (captchaVerifyParam: string) => void
  /** 验证失败回调 */
  fail: (error: { code: string; message: string }) => void
  /** 绑定验证码实例函数 */
  getInstance?: (instance: AliyunCaptchaInstance) => void
  /** 滑块验证码样式 */
  slideStyle?: {
    width: number
    height: number
  }
  /** 验证码语言类型 */
  language?: 'cn' | 'tw' | 'en'
}

/** 阿里云验证码实例 */
interface AliyunCaptchaInstance {
  /** 重置验证码 */
  reset: () => void
  /** 销毁验证码 */
  destroy: () => void
}

declare global {
  interface Window {
    /** 阿里云验证码配置 */
    AliyunCaptchaConfig?: AliyunCaptchaConfig
    /** 初始化阿里云验证码 */
    initAliyunCaptcha?: (options: AliyunCaptchaOptions) => void
  }
}

export {}
