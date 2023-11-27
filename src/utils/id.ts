import { nanoid } from 'nanoid'

/**
 * ID 前缀
 */
export const ID_PREFIX = 'PFC'

/**
 * 创建一个随机ID
 * @param withPrefix 是否携带前缀
 */
export const createRandomId = (withPrefix = true) => {
	const randomId = nanoid()
	if (!withPrefix) {
		return randomId
	}
	return `${ID_PREFIX}-${randomId}`
}

/**
 * 判断一个字符串是否为 createRandomId 生成的ID
 */
export const isFrontendCustomId = (id: string) => {
	return id?.startsWith(ID_PREFIX)
}
