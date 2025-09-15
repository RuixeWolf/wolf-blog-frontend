/**
 * 四舍五入保留指定小数位
 * @param num - 原数值
 * @param fractionDigits - 小数位数
 * @returns 处理结果
 */
export function round(num: number, fractionDigits = 0): number {
  return Math.round(num * 10 ** fractionDigits) / 10 ** fractionDigits
}

/**
 * 向下取整保留指定小数位
 * @param num - 原数值
 * @param fractionDigits - 小数位数
 * @returns 处理结果
 */
export function floor(num: number, fractionDigits = 0): number {
  return Math.floor(num * 10 ** fractionDigits) / 10 ** fractionDigits
}

/**
 * 向上取整保留指定小数位
 * @param num - 原数值
 * @param fractionDigits - 小数位数
 * @returns 处理结果
 */
export function ceil(num: number, fractionDigits = 0): number {
  return Math.ceil(num * 10 ** fractionDigits) / 10 ** fractionDigits
}
