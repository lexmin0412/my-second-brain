import { OssClientInitProps } from "@/utils";
import OssClient from "@/utils/oss";
import { message } from "antd";
import dayjs from "dayjs";
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
			// 校验过期时间
			if (dayjs(parsedConfig.expiration).isBefore(dayjs())) {
				// 过期则重新初始化
				message.error("登录已过期，请重新登录");
				setOssInitModalOpen(true);
			} else {
				initOSSClient(parsedConfig);
			}
		}
	}, []);

	return {
		ossClient,
		ossInitModalOpen,
		initOSSClient,
		setOssInitModalOpen,
	}
}
