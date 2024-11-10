import AddFileModal, {
  AddFileModalOnOkValues,
} from "@/docs/components/add-file-modal";
import OSSInitModal from "@/docs/components/oss-init-modal";
import Sidebar, {SidebarItem} from "@/docs/components/sidebar";
import {useOssClient} from "@/hooks";
import {GlobalContext} from "@/hooks/context";
import {isMobile, OssClientInitProps} from "@/utils";
import {LexminFooter} from "@lexmin0412/wc-react";
import {useRequest} from "ahooks";
import {Button, Col, message, Row, Space} from "antd";
import dayjs from "dayjs";
import {useState, useEffect} from "react";
import {useHistory, Link} from "pure-react-router";

const FeatureList = [
  {
    link: "/docs",
    title: "文章",
    icon: "🎯",
    description:
      "用于书写体系化的文章，支持代码块、图片等完整的 Markdown 语法。",
  },
  {
    link: "/notes",
    title: "小记",
    icon: "🚀",
    description:
      "记录一瞬间的想法，快速记录免遗忘，方便后续查找并可以扩充成文章。",
  },
];

export default function Home() {
  const history = useHistory();
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
    <div className="overflow-hidden h-full ">
      <div
        className={`${
          isMobile() ? "w-full px-3" : "w-3/5 mx-auto"
        } text-center pt-10 pb-4 box-border overflow-auto`}
        style={{
          height: "calc(100% - 64px)",
        }}
      >
        <img
          src="https://lexmin.oss-cn-hangzhou.aliyuncs.com/statics/common/24385370.jpeg"
          className="w-36 h-36  rounded-[50%]"
        />

        <div className="text-3xl mt-6 font-bold">My Second Brain</div>

        <div className="text-lg mt-6">
          一个记录一切的 Markdown 编辑器，做你的第二大脑。
        </div>

        <div className="mt-8">
          <Space size="large">
            <Button
              type="default"
              className="h-10 w-32 rounded-3xl"
              onClick={() => {
                message.info("文档完善中，敬请期待");
              }}
            >
              介绍
            </Button>
            <Button
              type="primary"
              className="h-10 w-32 rounded-3xl"
              onClick={() => {
                history.push("/docs");
              }}
            >
              现在开始
            </Button>
          </Space>
        </div>

        <Row className="mt-12 flex items-center">
          {/* 🚀 */}
          {FeatureList.map((item) => {
            return (
              <Col key={item.title} span={isMobile() ? 24 : 12} className='mb-3'>
                <Link
                  to={item.link}
                  className="bg-[#F9F9F9] mx-3 rounded-2xl p-4 cursor-pointer inline-block text-[#222]"
                >
                  <div className="text-3xl">{item.icon}</div>
                  <div className="mt-3 text-base font-bold">{item.title}</div>
                  <div className="mt-3">{item.description}</div>
                </Link>
              </Col>
            );
          })}
        </Row>
      </div>

      <LexminFooter />
    </div>
  );
}
