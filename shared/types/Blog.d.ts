/** 博客相关类型定义 */
declare namespace Blog {
  /** 博客信息 */
  interface BlogInfo {
    /** 文章唯一标识符 */
    id: number
    /** 文章标题 */
    title: string
    /** 文章摘要/主要内容概述 */
    primary: string
    /** 作者用户ID */
    authorId: number
    /** 文章发布时间 */
    postTime: string
  }

  /** 博客详情 */
  interface BlogDetail extends BlogInfo {
    /** 文章正文内容 */
    content: string
    /** 文章所属分区ID */
    partitionId: number
    /** 文章标签列表 */
    tags: string[]
    /** 常用标签 ID 列表 */
    comUseTags: number[]
  }

  /** 博客列表 */
  type BlogList = BlogInfo[]
}
