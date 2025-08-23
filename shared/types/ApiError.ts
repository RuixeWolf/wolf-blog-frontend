/** API 错误类 */
export class ApiError extends Error {
  /** 错误代码 */
  public readonly code: string
  /** 响应数据 */
  public readonly data: unknown

  constructor(response: { code: string; message: string; data?: unknown }) {
    super(response.message)
    this.code = response.code
    this.data = response.data
  }
}
