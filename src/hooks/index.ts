/**
 * 异步获取 Sidebar 列表
 */
export const useSidebarItems = () => {
	return {
		loading: false,
		sidebarItems: [
			{
				id: '1',
				title: 'test article1'
			},
			{
				id: '2',
				title: 'test article2'
			},
		]
	}
}
