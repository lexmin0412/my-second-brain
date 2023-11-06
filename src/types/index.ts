/**
 * 快捷操作
 * bold - 加粗
 * italic - 斜体
 * link - 链接
 * image - 图片
 * code - 代码块
 * table - 表格
 */
export type ShortCutAction = 'bold' | 'italic' | 'link' | 'image' | 'code' | 'table'

/**
 * 快捷键类型映射
 */
export const ShortCutMap: Record<string, ShortCutAction> = {
	'ctrl+b': 'bold',
	'ctrl+i': 'italic',
	'ctrl+l': 'link',
	'ctrl+p': 'image',
	'ctrl+d': 'code',
	'ctrl+t': 'table'
}
