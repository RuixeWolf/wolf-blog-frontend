/**
 * 格式化日期时间
 * @param date - 指定日期时间，默认为当前日期时间
 * @param format - 格式化选项，默认为 `YYYY-MM-DD HH:mm:SS.sss`
 * @returns 格式化的日期时间字符串
 */
export function formatDateTime(
  date?: string | number | Date,
  format: string = 'YYYY-MM-DD HH:mm:SS.sss'
): string {
  /** 日期时间对象 */
  const dateObject = date ? new Date(date) : new Date()

  /** 格式化选项 */
  const options = {
    // 年，匹配多个连续的 `Y`，如 `YYYY`
    'Y+': dateObject.getFullYear().toString(),
    // 月，匹配多个连续的 `M`，如 `MM`
    'M+': (dateObject.getMonth() + 1).toString(),
    // 日，匹配多个连续的 `D`，如 `DD`
    'D+': dateObject.getDate().toString(),
    // 时，匹配多个连续的 `H`，如 `HH`
    'H+': dateObject.getHours().toString(),
    // 分，匹配多个连续的 `m`，如 `mm`
    'm+': dateObject.getMinutes().toString(),
    // 秒，匹配多个连续的 `S`，如 `SS`
    'S+': dateObject.getSeconds().toString(),
    // 毫秒，匹配多个连续的 `s`，如 `sss`
    's+': dateObject.getMilliseconds().toString()
  }

  /** 返回值 */
  let result = format

  // 遍历匹配格式化选项，替换日期时间内容
  Object.entries(options).forEach(([regExp, dateItemStr]) => {
    result = result.replace(new RegExp(`(${regExp})`, 'g'), (substring) =>
      // 替换匹配到的日期时间内容并补零
      dateItemStr.padStart(substring.length, '0')
    )
  })

  // 匹配替换完成，返回格式化后的日期时间字符串
  return result
}

/**
 * 比较两个日期时间的大小
 * @param date1 - 第一个日期时间，可以是字符串、时间戳数值或 Date 对象
 * @param date2 - 第二个日期时间，可以是字符串、时间戳数值或 Date 对象
 * @returns 一个数值，表示 date1 和 date2 的大小关系。如果 date1 大于 date2，返回正数；如果 date1 小于 date2，返回负数；如果相等，返回 0。
 */
export function sortDateTime(
  date1: string | number | Date | null,
  date2: string | number | Date | null
): number {
  return new Date(date1 || 0).getTime() - new Date(date2 || 0).getTime()
}
