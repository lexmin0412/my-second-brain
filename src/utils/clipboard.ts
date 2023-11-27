/**
 * 获取剪贴板中的图片 Blob
 */
export const pastImage = async() => {
	return new Promise((resolve) => {
		// 检查浏览器是否支持Clipboard API
		if (navigator.clipboard && navigator.clipboard.read) {
			// 读取剪贴板中的图片
			navigator.clipboard.read().then(async function (data) {
				let result = null
				// 遍历剪贴板中的数据
				for (const item of data) {
					// 检查数据类型是否为图片
					if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
						// 将图片数据转换为Blob对象
						const blob = await item.getType('image/png') || item.getType('image/jpeg');
						result = blob
					}
				}
				console.log('shittt', result)
				resolve(result)
			}).catch(function (error) {
				console.error('无法从剪贴板读取图片:', error);
			});
		} else {
			console.error('浏览器不支持Clipboard API');
		}
	})
}
