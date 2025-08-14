/** API 错误 */
export class ApiError extends Error {
  /**
   * 状态码
   * @description 大写下划线分词字符串，示例 `RESOURCE_NOT_FOUND`
   */
  code: string
  constructor(error: Pick<ApiResponse<unknown>, 'message' | 'code'>) {
    super(error.message)
    this.code = error.code
  }
}
