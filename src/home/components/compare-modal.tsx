import {Modal} from "antd";
import {useEffect, useState} from "react";
import CompareEditor from "./compare-editor";
import localforage from 'localforage'

interface CompareModalProps {
  fileKey: string;
  initialContent: string;
  onInitialzed: (content: string) => void;
}

export default function CompareModal(props: CompareModalProps) {
  const {fileKey, initialContent, onInitialzed} = props;
  const [open, setOpen] = useState(false);
	const [storageContent, setStorageContent] = useState('');

  const validateConflict = async () => {
    const storageContent = await localforage.getItem<string>(`MSB-Content-${fileKey}`);
		setStorageContent(storageContent as string);
    if (storageContent && storageContent !== initialContent) {
      setOpen(true);
    } else {
			onInitialzed(initialContent)
		}
  };

  useEffect(() => {
    validateConflict();
  }, [fileKey]);

  const onOk = () => {
    Modal.confirm({
      title: "确定使用云端内容?",
      content: "本地缓存将会被覆盖为云端内容",
      onOk: () => {
				setOpen(false);
        onInitialzed(initialContent);
      },
    });
  };

  const onCancel = () => {
    Modal.confirm({
      title: "确定使用本地内容?",
      content: "再次发布后，云端版本将会被覆盖为本地内容",
      onOk: () => {
				setOpen(false)
        onInitialzed(storageContent);
      },
    });
  };

  return (
    <Modal
			closable={false}
			maskClosable={false}
			width='90vw'
			title='内容冲突，请解决'
      cancelText="使用本地版本"
      okText="使用云端版本"
      open={open}
      onOk={onOk}
      onCancel={onCancel}
    >
      <CompareEditor
        contentList={[
          {
            title: "本地版本",
            content: storageContent,
          },
          {
            title: "云端版本",
            content: initialContent,
          },
        ]}
      />
    </Modal>
  );
}
