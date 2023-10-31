import {useOssClient, useSidebarItems} from "@/hooks";
import {message, Empty} from "antd";
import {GlobalContext} from "@/hooks/context";
import {OssClientInitProps} from "@/utils";
import {useEffect, useState} from "react";
import AddFileModal from "./components/add-file-modal";
import Editor from "./components/editor";
import OSSInitModal from "./components/oss-init-modal";
import Sidebar, {SidebarItem} from "./components/sidebar";

export default function Home() {
  const {
    // sidebarItems,
    loading,
  } = useSidebarItems();

  const [editorInitialContent, setEditorInitialContent] = useState("");
  const {ossClient, ossInitModalOpen, initOSSClient, setOssInitModalOpen} =
    useOssClient();
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [selectedSidebarItem, setSelectedSidebarItem] = useState<SidebarItem>();
  const [addFileModalOpen, setAddFileModalOpen] = useState(false);

  const handleOssInitModalConfirm = (values: OssClientInitProps) => {
    initOSSClient(values);
    setOssInitModalOpen(false);
  };

  const handleSidebarChange = async (item: SidebarItem) => {
    const fileName = item.title;
    const result = await ossClient?.get(fileName);
    setEditorInitialContent(result?.content.toString());
    setSelectedSidebarItem(item);
  };

  const refreshSidebarItems = () => {
    return ossClient?.list().then((res) => {
      const newList = res.objects?.map((item) => {
        const sliceStartIndex = item.name.indexOf("/articles") + 10;
        const sliceEndIndex = item.name.indexOf(".md");
        return {
          ...item,
          id: item.url,
          title: item.name.slice(sliceStartIndex, sliceEndIndex),
        };
      });
      setSidebarItems(newList);
      return newList;
    });
  };

  console.log("sidebarItems", sidebarItems);

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
    await ossClient?.put(values.fileName, "");
    message.success("新增成功");
    setAddFileModalOpen(false);
    handlePublishSuccess();
    const refreshRes = await refreshSidebarItems();
    console.log("refreshRes", refreshRes);
    const newSelectedItem = refreshRes?.find(
      (item) => item.title === values.fileName
    );
    handleSidebarChange(newSelectedItem);
  };

  return (
    <GlobalContext.Provider
      value={{
        ossClient,
        selectedSidebarItem,
      }}
    >
      <div className="flex flex-col h-screen">
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
        <div className="flex flex-1">
          {/* 侧边栏 */}
          <div className="w-52 border-0 border-r border-solid border-r-[#eff0f5] bg-slate-10 h-full">
            <div
              className="h-10 leading-10 text-center cursor-pointer hover:bg-[#4688ff] hover:text-white"
              onClick={handleAddBtnClick}
            >
              + 新建{" "}
            </div>
            {loading ? (
              "loading"
            ) : (
              <Sidebar items={sidebarItems} onChange={handleSidebarChange} />
            )}
          </div>

          {/* 内容区 只有选中文章时才展示 */}
          {selectedSidebarItem ? (
            <div className="flex-1 h-full box-border">
              <Editor
                initialContent={editorInitialContent}
                onPublishSuccess={handlePublishSuccess}
              />
            </div>
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
