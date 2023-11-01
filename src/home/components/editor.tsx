import {ChangeEvent, useContext, useEffect, useState} from "react";
import Markdown from "react-markdown";
import { message, Modal, Spin } from 'antd'
import PublishConfirmModal from "./publish-confirm-modal";
import { GlobalContext } from "@/hooks/context";

interface EditorProps {
	/**
	 * 编辑器 loading
	 */
	loading?: boolean
  /**
   * 初始值
   */
  initialContent: string;
	/**
	 * 发布成功回调
	 */
  onPublishSuccess: () => void
}

export default function Editor(props: EditorProps) {

	const {loading, initialContent, onPublishSuccess} = props;

  const [content, setContent] = useState("");
	const [publishConfirmModalOpen, setPublishConfirmModalOpen] = useState(false);
	const { ossClient, selectedSidebarItem } = useContext(GlobalContext)

	useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

	/**
	 * 更新文档
	 */
	const handleDocUpdate = async(values: {fileName: string}) => {
    await ossClient?.put(values.fileName, content);
		message.success('发布成功')
		setPublishConfirmModalOpen(false)
		onPublishSuccess()
  };

	/**
	 * 发布按钮点击
	 */
	const handlePublishBtnClick = async() => {
		if (selectedSidebarItem) {
			Modal.confirm({
				title: '发布确认',
				onOk: () => {
					return handleDocUpdate({
            fileName: selectedSidebarItem.title,
          });
				}
			})
		} else {
			setPublishConfirmModalOpen(true)
		}
	}

  return (
    <Spin spinning={loading} className='tsb-spin'>
      <div className="flex w-full h-full box-border relative">
        <textarea
          value={content}
          placeholder="请输入内容开始编辑"
          className="flex-1 border-0 w-full h-full block outline-none border-r border-solid border-r-[#eff0f5] resize-none p-4 box-border text-base"
          onChange={handleChange}
        />
        <Markdown className="flex-1 p-4">{content}</Markdown>
        <div className="absolute top-4 right-4">
          <button
            className="bg-[#4c81ff] text-white h-9 leading-9 px-4 rounded-md cursor-pointer"
            onClick={handlePublishBtnClick}
          >
            发布
          </button>
        </div>

        <PublishConfirmModal
          open={publishConfirmModalOpen}
          onCancel={() => setPublishConfirmModalOpen(false)}
          onOk={handleDocUpdate}
        />
      </div>
    </Spin>
  );
}
