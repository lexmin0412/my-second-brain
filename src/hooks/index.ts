import { OssClientInitProps } from "@/utils";
import OssClient from "@/utils/oss";
import { useEffect, useState } from "react";

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

export const useOssClient = () => {

	const [ossClient, setOssClient] = useState<OssClient>();
	const [ossInitModalOpen, setOssInitModalOpen] = useState(false);

	/**
	 * 初始化 OSS 实例
	 */
	const initOSSClient = (config: OssClientInitProps) => {
		const newOssClient = new OssClient(config);
		setOssClient(newOssClient);
		localStorage.setItem("oss-config", JSON.stringify(config));
	};

	useEffect(() => {
		const storageConfigs = localStorage.getItem("oss-config");
		if (!storageConfigs) {
			setOssInitModalOpen(true);
		} else {
			const parsedConfig = JSON.parse(storageConfigs);
			initOSSClient(parsedConfig)
		}
	}, []);

	return {
		ossClient,
		ossInitModalOpen,
		initOSSClient,
		setOssInitModalOpen,
	}
}
