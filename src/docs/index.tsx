import {useOssClient} from "@/hooks";
import {Button, message, Empty, Drawer, Modal, Menu} from "antd";
import {useRequest} from "ahooks";
import dayjs from "dayjs";
import {GlobalContext} from "@/hooks/context";
import {type OssClientInitProps, isMobile} from "@/utils";
import {useEffect, useRef, useState} from "react";
import AddFileModal, {
  AddFileModalOnOkValues,
} from "./components/add-file-modal";
import Editor from "./components/editor";
import OSSInitModal from "./components/oss-init-modal";
import Sidebar, {SidebarItem} from "./components/sidebar";
import "./index.less";
import FloatActions from "./components/float-actions";
import SettingModal, {
  LayoutVisibleConfig,
  SettingModalOnOkValues,
} from "./components/setting-modal";
import {useLocalStorageState} from "@/hooks/use-local-storage-state";
import { EditorRef } from "./components/editor/types";
import { defineCustomElements, LexminFooter } from '@lexmin0412/wc-react'
import { useHistory } from 'pure-react-router'
defineCustomElements()

const isOnMobile = isMobile();

export default function Home() {
	const history  = useHistory()
  const currentFileName = window.location.search?.slice(10);
  const [editorInitialContent, setEditorInitialContent] = useState("");
  const {ossClient, ossInitModalOpen, initOSSClient, setOssInitModalOpen} =
    useOssClient();
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [selectedSidebarItem, setSelectedSidebarItem] = useState<SidebarItem>();
  const [addFileModalOpen, setAddFileModalOpen] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [settingModalOpen, setSettingModalOpen] = useState(false);
  const [menuSidebarOpen, setMenuSidebarOpen] = useState(false);
  const [layoutVisibleConfig, setLayoutVisibleConfig] =
    useLocalStorageState<LayoutVisibleConfig>("msb-visible-setting", {
      // 初始化默认值以缓存优先
      sidebar: true,
      editor: true,
      preview: true,
    });
  const editorRef = useRef<EditorRef|null>(null);
  // 当前文章是否在本地有更改未发布
  const [contentUnPublished, setContentUnPublished] = useState(false);

  const handleOssInitModalConfirm = (values: OssClientInitProps) => {
    initOSSClient(values);
    setOssInitModalOpen(false);
  };

	const toggleDoc = async (fileName: string, item: SidebarItem) => {
    // 修改 history path
    history.push(`/docs?fileName=${item.name}`);

    try {
      const result = await ossClient?.get(fileName);
      setEditorLoading(false);
      setEditorInitialContent(result?.content.toString());
      setSelectedSidebarItem(item);
			setMenuSidebarOpen(false)
    } catch (error) {
      console.log("get file error", error);
      message.error("内容加载失败");
    }
  };

  /**
   * 切换 sidebar
   * @param fullTitle 完整标题，如果是嵌套接口，则 fullTitle 为 parent/title
   * @param item 选中的item
   */
  const handleSidebarChange = async (fullTitle: string, item: SidebarItem) => {
    setEditorLoading(true);

    if (contentUnPublished) {
      Modal.confirm({
        maskClosable: false,
        closable: false,
        title: "当前文档有更改未发布，是否立即发布",
        content: "未发布的内容将仅缓存在本地，存在数据丢失风险",
        okText: "发布并继续当前操作",
        cancelText: "忽略并继续当前操作",
        onOk: async() => {
					console.log('开始发布')
          await editorRef.current?.publish();
					console.log('结束发布')
          toggleDoc(fullTitle, item);
					setContentUnPublished(false)
					return Promise.resolve()
        },
        onCancel: () => {
          toggleDoc(fullTitle, item);
					setContentUnPublished(false);
        },
      });
    } else {
			toggleDoc(fullTitle, item);
		}
  };

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
        if (selectedItem) {
          toggleDoc((selectedItem as SidebarItem).fullTitle, selectedItem);
        }
        return newList;
      }) as Promise<SidebarItem[]>;
    }
  );

  useEffect(() => {
    if (ossClient) {
      refreshSidebarItems();
    }
  }, [ossClient]);

  const handlePublishSuccess = () => {
    refreshSidebarItems();
  };

  const handleAddBtnClick = () => {
    setAddFileModalOpen(true);
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

  const handleSettingModalConfirm = (values: SettingModalOnOkValues) => {
    setSettingModalOpen(false);
    setLayoutVisibleConfig(values.visible);
  };

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

  const folderOptions = sidebarItems.filter((item) => item.isFolder);

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
          {/* 侧边栏 */}
          {!isOnMobile && layoutVisibleConfig.sidebar ? (
            <div className="w-52 border-0 border-r border-solid border-r-[#eff0f5] bg-slate-10 h-full overflow-auto resize-x">

              <Menu mode="inline" items={sidebarItems.map((item)=>{
                return {
                  ...item,
                  key: item.name,
                  label: item.title,
                  children: item.children?.map((child)=>{
                    return {
                      ...child,
                      key: child.name,
                      label: child.title
                    }
                  })
                }
              })}
                onSelect={(e)=>{
                  handleSidebarChange(e.item.props.fullTitle, e.item.props)
                }}
              >

              </Menu>

              {/* <Sidebar
                showActionButtons={false}
                loading={sidebarLoading}
                items={sidebarItems}
                onChange={handleSidebarChange}
                onRename={handleFileRename}
                onDelete={handleFileDelete}
              /> */}
            </div>
          ) : null}

          {/* 内容区 只有选中文章时才展示 */}
          <div className="flex-1 h-full box-border overflow-hidden">
            {selectedSidebarItem ? (
              <Editor
                ref={editorRef}
                editorVisible={layoutVisibleConfig.editor}
                previewVisible={layoutVisibleConfig.preview}
                loading={editorLoading}
                initialContent={editorInitialContent}
                onPublishSuccess={handlePublishSuccess}
                onContentUpdate={(isNew: boolean) =>
                  setContentUnPublished(isNew)
                }
              />
            ) : (
              <Empty
                description="新建一个文档，开始知识之旅吧～"
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              />
            )}
          </div>
        </div>

        {/* 底部 */}
        <LexminFooter />

        <FloatActions
          onAddFile={handleAddBtnClick}
          onSettingBtnClick={() => setSettingModalOpen(true)}
          onMenuBtnClick={() => setMenuSidebarOpen(true)}
        />

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

        <SettingModal
          open={settingModalOpen}
          initialValues={{
            visible: layoutVisibleConfig,
          }}
          onCancel={() => setSettingModalOpen(false)}
          onOk={handleSettingModalConfirm}
        />

        {/* 侧边栏菜单 */}
        <Drawer
          title="文档列表"
          placement="right"
          width={"80%"}
          onClose={() => setMenuSidebarOpen(false)}
          open={menuSidebarOpen}
          closable={false}
          styles={{
            body: {
              padding: "12px",
            },
          }}
        >
          <div className="h-full flex flex-col">
            <Sidebar
              showActionButtons={false}
              loading={sidebarLoading}
              items={sidebarItems}
              onChange={toggleDoc}
              onRename={handleFileRename}
              onDelete={handleFileDelete}
            />
            <Button
              size="large"
              type="primary"
              className="m-2"
              onClick={() => setMenuSidebarOpen(false)}
            >
              关闭
            </Button>
          </div>
        </Drawer>
      </div>
    </GlobalContext.Provider>
  );
}
