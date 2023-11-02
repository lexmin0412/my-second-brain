import {useOssClient} from "@/hooks";
import {message, Empty} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import {useRequest} from "ahooks";
import dayjs from "dayjs";
import {GlobalContext} from "@/hooks/context";
import {OssClientInitProps} from "@/utils";
import {useEffect, useState} from "react";
import AddFileModal from "./components/add-file-modal";
import Editor from "./components/editor";
import OSSInitModal from "./components/oss-init-modal";
import Sidebar, {SidebarItem} from "./components/sidebar";
import "./index.less";

export default function Home() {
  const [editorInitialContent, setEditorInitialContent] = useState("");
  const {ossClient, ossInitModalOpen, initOSSClient, setOssInitModalOpen} =
    useOssClient();
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [selectedSidebarItem, setSelectedSidebarItem] = useState<SidebarItem>();
  const [addFileModalOpen, setAddFileModalOpen] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);

  const handleOssInitModalConfirm = (values: OssClientInitProps) => {
    initOSSClient(values);
    setOssInitModalOpen(false);
  };

  const handleSidebarChange = async (item: SidebarItem) => {
    const fileName = item.title;
    setEditorLoading(true);
    try {
      const result = await ossClient?.get(fileName);
      setEditorLoading(false);
      setEditorInitialContent(result?.content.toString());
      setSelectedSidebarItem(item);
    } catch (error) {
      console.log("get file error", error);
      message.error("内容加载失败");
    }
  };

  const {runAsync: refreshSidebarItems, loading: sidebarLoading} = useRequest(
    () => {
      return ossClient?.list().then((res) => {
        const newList = res.objects
          ?.map((item) => {
            const sliceStartIndex = item.name.indexOf("/articles") + 10;
            const sliceEndIndex = item.name.indexOf(".md");
            return {
              ...item,
              id: item.url,
              title: item.name.slice(sliceStartIndex, sliceEndIndex),
            };
          })
          ?.sort((prev, cur) => {
            // 按更新时间由新到老排列
            const sorted = dayjs(prev.lastModified).isAfter(
              dayjs(cur.lastModified)
            );
            return sorted ? -1 : 1;
          });
        setSidebarItems(newList);
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

  const handleAddFileModalOk = async (values: {fileName: string}) => {
    await ossClient?.put(values.fileName.trim(), "");
    message.success("新增成功");
    setAddFileModalOpen(false);
    handlePublishSuccess();
    const refreshRes = await refreshSidebarItems();
    const newSelectedItem = refreshRes?.find(
      (item: SidebarItem) => item.title === values.fileName
    );
    handleSidebarChange(newSelectedItem as SidebarItem);
  };

  const {runAsync: handleFileRename} = useRequest(
    (newFileName: string, item: SidebarItem) =>
      ossClient?.rename(item.title, newFileName.trim()) as Promise<unknown>,
    {
      manual: true,
      onSuccess: refreshSidebarItems,
    }
  );

  const {runAsync: handleFileDelete} = useRequest(
    (item: SidebarItem) => {
      return ossClient?.delete(item.title) as Promise<unknown>;
    },
    {
      manual: true,
      onSuccess: () => {
        refreshSidebarItems();
      },
    }
  );

  return (
    <GlobalContext.Provider
      value={{
        ossClient,
        selectedSidebarItem,
      }}
    >
      <div className="home-page-container flex flex-col h-screen overflow-hidden">
        {/* 头部 */}
        <div className=" h-16 flex items-center justify-between border-0 border-b border-solid border-b-[#eff0f5] px-6">
          <div className="flex items-center">
            <img
              className="block w-8 h-8 rounded-2xl"
              src="https://lexmin.oss-cn-hangzhou.aliyuncs.com/statics/common/24385370.jpeg"
            />
            <div className="cursor-pointer font-semibold ml-2">
              My Second Brain
            </div>
          </div>
          <div>
            <a
              href="https://github.com/lexmin0412/my-second-brain"
              className="font-semibold"
              target="_blank"
            >
              Github
            </a>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 侧边栏 */}
          <div className="w-52 border-0 border-r border-solid border-r-[#eff0f5] bg-slate-10 h-full overflow-auto">
            <div
              className="h-10 leading-10 text-center cursor-pointer hover:bg-[#4688ff] hover:text-white"
              onClick={handleAddBtnClick}
            >
              <PlusOutlined /> 新建
            </div>

            <Sidebar
              loading={sidebarLoading}
              items={sidebarItems}
              onChange={handleSidebarChange}
              onRename={handleFileRename}
              onDelete={handleFileDelete}
            />
          </div>

          {/* 内容区 只有选中文章时才展示 */}
          <div className="flex-1 h-full box-border">
            {selectedSidebarItem ? (
              <Editor
                loading={editorLoading}
                initialContent={editorInitialContent}
                onPublishSuccess={handlePublishSuccess}
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
        <div className="flex items-center justify-center h-16 border-0 border-t border-solid border-t-[#eff0f5] text-center">
          Created and maintained by{" "}
          <a
            href="https://github.com/lexmin0412"
            className="ml-1"
            target="_blank"
          >
            Lexmin0412
          </a>
          .
        </div>

        <OSSInitModal
          open={ossInitModalOpen}
          onCancel={() => setOssInitModalOpen(false)}
          onOk={handleOssInitModalConfirm}
        />

        <AddFileModal
          open={addFileModalOpen}
          onCancel={() => setAddFileModalOpen(false)}
          onOk={handleAddFileModalOk}
        />
      </div>
    </GlobalContext.Provider>
  );
}
