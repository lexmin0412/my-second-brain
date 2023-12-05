import {
  forwardRef,
  useContext,
  useImperativeHandle,
  useState,
} from "react";
import {message, Modal, Spin} from "antd";
import Markdown from "react-markdown";
import reactGFM from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import {useHotkeys} from "react-hotkeys-hook";
import PublishConfirmModal from "../publish-confirm-modal";
import {GlobalContext} from "@/hooks/context";
import {isMobile} from "@/utils";
import {ShortCutAction, ShortCutMap} from "@/types";
import {useStorageContent} from "@/hooks/use-storage-content";
import CompareModal from "../compare-modal";
import {EditorRef} from "./types";
import {pastImage} from "@/utils/clipboard";
import {createRandomId} from "@/utils/id";
import gfm from "@bytemd/plugin-gfm";
import codeHighlight from "@bytemd/plugin-highlight";
import mediumZoom from "@bytemd/plugin-medium-zoom";
import {Editor as ByteMDEditor} from "@bytemd/react";
import "bytemd/dist/index.css";
import "./editor.less";

const plugins = [
  gfm(),
  codeHighlight(),
	mediumZoom(),
];

interface EditorProps {
  /**
   * 编辑器 loading
   */
  loading?: boolean;
  /**
   * 初始值
   */
  initialContent: string;
  /**
   * 发布成功回调
   */
  onPublishSuccess: () => void;
  editorVisible: boolean;
  previewVisible: boolean;
  /**
   * 内容更新，用户触发编辑器修改时调用，用于判断本地文章是否有更改
   */
  onContentUpdate: () => void;
}

const isOnMobile = isMobile();

export const Editor: React.ForwardRefRenderFunction<EditorRef, EditorProps> = (
  props,
  ref
) => {
  const {
    loading,
    initialContent,
    onPublishSuccess,
    editorVisible,
    previewVisible,
    onContentUpdate,
  } = props;

  const [content, setContent] = useState("");
  const [publishConfirmModalOpen, setPublishConfirmModalOpen] = useState(false);
  const {ossClient, selectedSidebarItem} = useContext(GlobalContext);

  // 监听 content ，更新本地缓存
  useStorageContent(`MSB-Content-${selectedSidebarItem?.fullTitle}`, content);

  /**
   * 通过快捷键插入内容
   * TODO 在光标位置插入
   */
  const updateContent = async (action: ShortCutAction) => {
    console.log("action", action);
    switch (action) {
      case "bold":
        setContent(`${content}****`);
        break;
      case "italic":
        setContent(`${content}**`);
        break;
      case "link":
        setContent(`${content}[]()`);
        break;
      case "image": {
        const result = await pastImage();
        const randomName = createRandomId();
        const uploadRes = await ossClient?.uploadImage(
          randomName,
          result as string
        );
        if (uploadRes?.url) {
          setContent(`${content}![image](${uploadRes.url})`);
        }
        break;
      }
      case "code":
        setContent(`${content}\n\`\`\`\n\n\`\`\``);
        break;
      case "table":
        setContent(`${content}|标题|字段1|字段2|\n|-|-|-|\n`);
        break;
      default:
        break;
    }
  };

  useHotkeys(
    Object.keys(ShortCutMap),
    (e, handler) => {
      console.log("触发了", handler);
      const {keys, ...restHandlers} = handler;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const funcKey = Object.keys(restHandlers)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .filter((key) => handler[key])
        .join("");
      const fullKeys = `${funcKey}+${keys?.join("")}`;
      console.log("fullKeys", fullKeys);
      updateContent(ShortCutMap[fullKeys]);
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
    }
  );

  const handleChange = (newText: string) => {
    setContent(newText);
		if (newText !== initialContent) {
			onContentUpdate();
    }
  };

  /**
   * 更新文档
   */
  const handleDocUpdate = async (values: {fileName: string}) => {
    await ossClient?.put(values.fileName, content);
    console.log("发布完成");
    message.success("发布成功");
    setPublishConfirmModalOpen(false);
    onPublishSuccess();
  };

  /**
   * 发布按钮点击
   */
  const handlePublishBtnClick = async () => {
    if (selectedSidebarItem) {
      Modal.confirm({
        title: "发布确认",
        onOk: () => {
          return handleDocUpdate({
            fileName: selectedSidebarItem?.fullTitle,
          });
        },
      });
    } else {
      setPublishConfirmModalOpen(true);
    }
  };

  // 语法插件
  const remarkPlugins = [reactGFM];
  // 高亮插件
  const rehypePlugins = [rehypeRaw, rehypeHighlight];

  useImperativeHandle(ref, () => {
    return {
      publish: () => {
        return handleDocUpdate({
          fileName: selectedSidebarItem?.fullTitle as string,
        });
      },
    };
  });

  return (
    <Spin spinning={loading} className="tsb-spin">
      <div className="flex w-full h-full box-border relative">
        {/* 编辑区域 */}
        {isOnMobile || editorVisible ? (
          <div className="editor-wrapper w-full h-full">
            <ByteMDEditor
              value={content}
              plugins={plugins}
              onChange={handleChange}
            />
          </div>
        ) : null}

        {/* 预览区域 暂时先使用 ByteMD 自带的预览 */}
        {
          // eslint-disable-next-line no-constant-condition
          previewVisible && false ? (
            <Markdown
              className="flex-1 p-4 overflow-auto markdown-body"
              remarkPlugins={remarkPlugins}
              rehypePlugins={rehypePlugins}
            >
              {content}
            </Markdown>
          ) : null
        }

        {/* 发布按钮 */}
        {!isOnMobile ? (
          <div className="absolute top-10 right-4">
            <button
              className="bg-[#4c81ff] text-white h-9 leading-9 px-4 rounded-md cursor-pointer"
              onClick={handlePublishBtnClick}
            >
              发布
            </button>
          </div>
        ) : null}

        <PublishConfirmModal
          open={publishConfirmModalOpen}
          onCancel={() => setPublishConfirmModalOpen(false)}
          onOk={handleDocUpdate}
        />

        <CompareModal
          fileKey={selectedSidebarItem?.fullTitle || ""}
          initialContent={initialContent}
          onInitialzed={(newContent) => {
            setContent(newContent);
          }}
        />
      </div>
    </Spin>
  );
};

export default forwardRef(Editor);
