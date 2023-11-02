import { Modal, Spin } from 'antd'
import {EditOutlined, DeleteOutlined} from "@ant-design/icons";
import {GlobalContext} from "@/hooks/context";
import {useContext, useState} from "react";
import {useRequest} from 'ahooks'
import FileRenameModal from "./file-rename-modal";

export interface SidebarItem {
  id: string;
  title: string;
}

interface SidebarProps {
	loading?: boolean
  items: SidebarItem[];
  onChange: (item: SidebarItem) => void;
  onRename: (newFileName: string, item: SidebarItem) => Promise<unknown>;
	onDelete: (item: SidebarItem) => void
}

/**
 * 侧边栏
 */
export default function Sidebar(props: SidebarProps) {
  const {items, onChange, onRename, onDelete, loading} = props;
  const {selectedSidebarItem} = useContext(GlobalContext);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
	const [renamingItem, setRenamingItem] = useState<SidebarItem>()

  const handleSidebarItemCLick = (item: SidebarItem) => {
    onChange(item);
  };

  const handleRenameBtnClick = (item: SidebarItem) => {
		setRenameModalOpen(true)
		setRenamingItem(item)
	};

	const {runAsync: handleRenameModalConfirm,
	loading: confirmLoading} = useRequest(
    (values: {fileName: string}) =>
      onRename(values.fileName, renamingItem as SidebarItem) as Promise<unknown>
  , {
		manual: true,
		onSuccess: () => {
			setRenameModalOpen(false);
		}
	});

	const handleDeleteBtnClick = (item: SidebarItem) => {
		Modal.confirm({
      title: `确定要删除 ${item.title} 吗?`,
      onOk: ()=>onDelete(item),
    });
	}

  return (
    <Spin spinning={loading}>
      {items.map((item: SidebarItem) => {
        return (
          <div
            key={item.id}
            className={`h-10 flex items-center leading-10 border-0 border-t border-solid border-t-[#eff0f5] px-4 hover:bg-[#4688ff] hover:text-white cursor-pointer ${
              item.id === selectedSidebarItem?.id
                ? "bg-[#4688ff] text-white"
                : ""
            }`}
          >
            <div
              className="flex ellipsis-single mr-2 text-inherit flex-1"
              onClick={() => handleSidebarItemCLick(item)}
            >
              {item.title}
            </div>
            <EditOutlined onClick={() => handleRenameBtnClick(item)} />
            <DeleteOutlined className="ml-2" onClick={() => handleDeleteBtnClick(item)} />
          </div>
        );
      })}

      <FileRenameModal
        open={renameModalOpen}
        onCancel={() => setRenameModalOpen(false)}
        onOk={handleRenameModalConfirm}
        okButtonProps={{
          loading: confirmLoading,
        }}
        initialValues={{
          fileName: renamingItem?.title as string,
        }}
      />
    </Spin>
  );
}
