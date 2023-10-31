import { SidebarItem } from "@/home/components/sidebar";
import OssClient from "@/utils/oss";
import React from "react";

export const GlobalContext = React.createContext<{
	ossClient?: OssClient
	selectedSidebarItem?: SidebarItem
}>({
	ossClient: undefined,
	selectedSidebarItem: undefined
})
