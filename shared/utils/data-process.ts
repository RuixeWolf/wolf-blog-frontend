/**
 * 处理可选字段：undefined 时过滤，null 时保留，非空时格式化
 * @param value - 原始值
 * @param formatter - 格式化函数
 * @returns 处理后的值
 */
export function optionalField<T, R>(
  value: T | null | undefined,
  formatter: (value: T) => R
): R | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  return formatter(value)
}

/**
 * 过滤对象中的 undefined 字段
 * @param obj 原始对象
 * @returns 过滤后的对象
 */
export function filterUndefinedFields<T extends Record<string, unknown>>(
  obj: T
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) result[key] = value
  })
  return result
}
