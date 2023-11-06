import {ChangeEvent, useContext, useEffect, useState} from "react";
import {message, Modal, Spin} from "antd";
import Markdown from "react-markdown";
import reactGFM from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from 'rehype-raw'
import {useHotkeys} from "react-hotkeys-hook";
import PublishConfirmModal from "./publish-confirm-modal";
import {GlobalContext} from "@/hooks/context";
import { isMobile } from "@/utils";
import { ShortCutAction, ShortCutMap } from "@/types";

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
  previewVisible: boolean
}

const isOnMobile = isMobile();

export default function Editor(props: EditorProps) {
  const {loading, initialContent, onPublishSuccess, editorVisible, previewVisible} = props;

  const [content, setContent] = useState("");
  const [publishConfirmModalOpen, setPublishConfirmModalOpen] = useState(false);
  const {ossClient, selectedSidebarItem} = useContext(GlobalContext);

	/**
	 * 通过快捷键插入内容
	 * TODO 在光标位置插入
	 */
	const updateContent = (action: ShortCutAction) => {
		switch (action) {
			case 'bold':
				setContent(`${content}****`);
				break;
			case 'italic':
				setContent(`${content}**`);
				break;
			case 'link':
				setContent(`${content}[]()`);
				break;
			case 'image':
				setContent(`${content}![]()`);
				break;
			case 'code':
				setContent(`${content}\n\`\`\`\n\n\`\`\``);
				break;
			case 'table':
				setContent(`${content}|标题|字段1|字段2|\n|-|-|-|\n`);
				break
			default:
				break;
		}
		setContent
	}

	useHotkeys(
    Object.keys(ShortCutMap),
    (e, handler) => {
      console.log("触发了", handler);
			const { keys, ...restHandlers } = handler
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const funcKey = Object.keys(restHandlers).filter((key)=>!!handler[key]).join('')
			const fullKeys = `${funcKey}+${keys?.join('')}`
			console.log("fullKeys", fullKeys);
			updateContent(ShortCutMap[fullKeys]);
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
    }
  );

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  /**
   * 更新文档
   */
  const handleDocUpdate = async (values: {fileName: string}) => {
    await ossClient?.put(values.fileName, content);
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
            fileName: selectedSidebarItem.fullTitle,
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

  return (
    <Spin spinning={loading} className="tsb-spin">
      <div className="flex w-full h-full box-border relative">
        {/* 编辑区域 */}
        {!isOnMobile && editorVisible ? (
          <textarea
            value={content}
            placeholder="请输入内容开始编辑"
            className="flex-1 border-0 w-full h-full block outline-none border-r border-solid border-r-[#eff0f5] resize-none p-4 box-border text-base"
            onChange={handleChange}
          />
        ) : null}
        {/* 预览区域 */}
				{
					previewVisible ?
					<Markdown
						className="flex-1 p-4 overflow-auto markdown-body"
						remarkPlugins={remarkPlugins}
						rehypePlugins={rehypePlugins}
					>
						{content}
					</Markdown>
					: null
				}

        {/* 发布按钮 */}
        {!isOnMobile ? (
          <div className="absolute top-4 right-4">
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
      </div>
    </Spin>
  );
}
