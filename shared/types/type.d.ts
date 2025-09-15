/** Api 响应数据 */
declare interface ApiResponse<T = null> {
  /** 是否成功 */
  success: boolean
  /**
   * 状态码
   * @description `SUCCESS` 成功，其他为错误
   */
  code: string
  /** 响应消息 */
  message: string
  /** 响应数据 */
  data: T
}

/** Api 请求数据 - 分页列表 */
declare interface ApiListRequest {
  /** 当前页码 */
  pageNumber?: number
  /** 每页条数 */
  pageSize?: number
}

/** Api 响应数据 - 分页列表 */
declare interface ApiListData<T = null> {
  /** 当前页码 */
  currentPage: number
  /** 总页数 */
  totalPage: number
  /** 总记录数 */
  totalRow: number
  /** 数据列表 */
  records: T[]
}
