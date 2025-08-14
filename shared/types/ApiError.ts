/** API 错误类 */
export class ApiError extends Error {
  /** 错误代码 */
  public readonly code: string
  /** 响应数据 */
  public readonly data: unknown

  constructor(code: string, message: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.data = data
  }
}
