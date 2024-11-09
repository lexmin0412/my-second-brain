import AddFileModal, { AddFileModalOnOkValues } from "@/doc/components/add-file-modal";
import OSSInitModal from "@/doc/components/oss-init-modal";
import Sidebar, { SidebarItem } from "@/doc/components/sidebar";
import { useOssClient } from "@/hooks";
import { GlobalContext } from "@/hooks/context";
import { OssClientInitProps } from "@/utils";
import { LexminFooter } from "@lexmin0412/wc-react";
import { useRequest } from "ahooks";
import { message } from "antd";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { useHistory } from 'pure-react-router'
import LayoutHeader from "@/components/layout/header";

export default function Home() {
	const history = useHistory()
  const currentFileName = window.location.search?.slice(10);
  const {ossClient, ossInitModalOpen, initOSSClient, setOssInitModalOpen} =
    useOssClient();
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [selectedSidebarItem, setSelectedSidebarItem] = useState<SidebarItem>();
  const [addFileModalOpen, setAddFileModalOpen] = useState(false);

  const handleOssInitModalConfirm = (values: OssClientInitProps) => {
    initOSSClient(values);
    setOssInitModalOpen(false);
  };

  const toggleDoc = async (fileName: string, item: SidebarItem) => {
    // 修改 history path
    history.push(`/doc?fileName=${item.name}`);
  };

  useEffect(() => {
    if (ossClient) {
      refreshSidebarItems();
    }
  }, [ossClient]);

  const {runAsync: refreshSidebarItems, loading: sidebarLoading} = useRequest(
    () => {
      return ossClient?.list().then((res) => {
        const tempList: SidebarItem[] = [];
        res.objects?.forEach((item) => {
          const sliceStartIndex = item.name.indexOf("/articles") + 10;
          const lastSlashIndex = item.name.lastIndexOf("/") + 1;
          const sliceEndIndex = item.name.indexOf(".md");
          // 如果以斜杠结尾，证明是空文件夹
          if (item.name.endsWith("/")) {
            const fileName = item.name.slice(
              sliceStartIndex,
              item.name.length - 1
            );
            tempList.push({
              ...item,
              id: item.url,
              title: fileName,
              fullTitle: fileName,
              isFolder: true,
            });
          }
          // 如果最后一个斜杠的位置与 /articles/ 结束位置相等，则证明是 articles 下的顶级文件
          else if (sliceStartIndex === lastSlashIndex) {
            const fileName = item.name.slice(sliceStartIndex, sliceEndIndex);
            tempList.push({
              ...item,
              id: item.url,
              title: fileName,
              fullTitle: fileName,
              isFolder: false,
            });
          } else {
            const folderName = item.name.slice(
              sliceStartIndex,
              lastSlashIndex - 1
            );
            const fileName = item.name.slice(lastSlashIndex, sliceEndIndex);
            // 如果既不是顶级文件夹，又不是顶级文件，那就只能是嵌套文件了
            const existedFolder = tempList.find(
              (ele) => ele.title === folderName
            );
            const itemTitle = item.url.slice(0, lastSlashIndex);
            if (existedFolder) {
              existedFolder.children = (existedFolder.children || []).concat({
                ...item,
                id: `${existedFolder.title}${item.url}`,
                title: fileName,
                fullTitle: `${existedFolder.title}/${fileName}`,
                isFolder: false,
              });
            } else {
              tempList.push({
                ...item,
                name: item.name.slice(0, item.name.lastIndexOf(fileName)),
                id: itemTitle,
                title: folderName,
                fullTitle: folderName,
                isFolder: true,
                children: [
                  {
                    ...item,
                    id: `${itemTitle}${item.url}`,
                    title: fileName,
                    fullTitle: `${folderName}/${fileName}`,
                    isFolder: false,
                  },
                ],
              });
            }
          }
        });
        const newList = tempList.sort((prev, cur) => {
          // 按更新时间由新到老排列
          const sorted = dayjs(prev.lastModified).isAfter(
            dayjs(cur.lastModified)
          );
          return sorted ? -1 : 1;
        });
        setSidebarItems(newList);
        console.log("newList", newList);
        let selectedItem: SidebarItem | undefined = undefined;
        newList.find((item) => {
          if (item.name === decodeURIComponent(currentFileName)) {
            selectedItem = item;
          } else {
            if (item.children) {
              item.children.forEach((ele) => {
                if (ele.name === decodeURIComponent(currentFileName)) {
                  selectedItem = ele;
                }
              });
            }
          }
        });
        return newList;
      }) as Promise<SidebarItem[]>;
    }
  );
  const {runAsync: handleFileRename} = useRequest(
    (newFileName: string, item: SidebarItem) => {
      if (item.isFolder) {
        return ossClient?.renameFolder(
          item.title,
          newFileName
        ) as Promise<unknown>;
      }
      let newFullFileName = "";
      if (item.title === item.fullTitle) {
        newFullFileName = newFileName;
      } else {
        newFullFileName = `${item.fullTitle.slice(
          0,
          item.fullTitle.indexOf(item.title) - 1
        )}/${newFileName}`;
      }
      return ossClient?.rename(
        item.fullTitle,
        newFullFileName.trim()
      ) as Promise<unknown>;
    },
    {
      manual: true,
      onSuccess: refreshSidebarItems,
    }
  );
  const folderOptions = sidebarItems.filter((item) => item.isFolder);

  const handlePublishSuccess = () => {
    refreshSidebarItems();
  };

  const handleAddFileModalOk = async (values: AddFileModalOnOkValues) => {
    if (values.type === "folder") {
      await ossClient?.addFolder(`${values.fileName}`.trim());
    } else {
      await ossClient?.put(values.fileName.trim(), "");
    }
    message.success("新增成功");
    setAddFileModalOpen(false);
    handlePublishSuccess();
    const refreshRes = await refreshSidebarItems();

    // 截取真实文件名
    const slashIndex = values.fileName.indexOf("/");
    const trulyFileName =
      slashIndex > -1 ? values.fileName.slice(slashIndex + 1) : values.fileName;

    let newSelectedItem: SidebarItem | undefined = undefined;
    refreshRes?.find((item: SidebarItem) => {
      if (item.title === trulyFileName) {
        newSelectedItem = item;
      }
      if (item.children?.length) {
        item.children.find((child) => {
          if (child.title === trulyFileName) {
            newSelectedItem = child;
          }
        });
      }
    });
    if (values.type === "file" && newSelectedItem) {
      toggleDoc(
        (newSelectedItem as SidebarItem).fullTitle as string,
        newSelectedItem as SidebarItem
      );
    }
  };
  /**
   * 切换 sidebar
   * @param fullTitle 完整标题，如果是嵌套接口，则 fullTitle 为 parent/title
   * @param item 选中的item
   */
  const handleSidebarChange = async (fullTitle: string, item: SidebarItem) => {
    toggleDoc(fullTitle, item);
  };

  const {runAsync: handleFileDelete} = useRequest(
    (item: SidebarItem) => {
      if (item.isFolder) {
        return ossClient?.deleteFolder(item.fullTitle) as Promise<unknown>;
      }
      return ossClient?.delete(item.fullTitle) as Promise<unknown>;
    },
    {
      manual: true,
      onSuccess: () => {
        refreshSidebarItems();
      },
    }
  );

	console.log("sidebarItems", sidebarItems);

  return (
    <GlobalContext.Provider
      value={{
        ossClient,
        selectedSidebarItem,
      }}
    >
      <div className="home-page-container flex flex-col h-screen overflow-hidden text-[#222]">

        {/* 主内容区 */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            showActionButtons={true}
            loading={sidebarLoading}
            items={sidebarItems}
            onChange={handleSidebarChange}
            onRename={handleFileRename}
            onDelete={handleFileDelete}
          />
        </div>

        {/* 底部 */}
        <LexminFooter />

        <OSSInitModal
          open={ossInitModalOpen}
          onCancel={() => setOssInitModalOpen(false)}
          onOk={handleOssInitModalConfirm}
        />

        <AddFileModal
          open={addFileModalOpen}
          folderOptions={folderOptions}
          onCancel={() => setAddFileModalOpen(false)}
          onOk={handleAddFileModalOk}
        />
      </div>
    </GlobalContext.Provider>
  );
}
