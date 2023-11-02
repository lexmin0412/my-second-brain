import {Modal, Spin} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  FileOutlined,
} from "@ant-design/icons";
import {GlobalContext} from "@/hooks/context";
import {useContext, useState} from "react";
import {useRequest} from "ahooks";
import FileRenameModal from "./file-rename-modal";

export interface SidebarItem {
  id: string;
  title: string;
	/**
	 * 包含了父元素名称的组合
	 */
  fullTitle: string
  /**
   * 是否文件夹
   */
  isFolder: boolean;
  /**
   * 子节点
   */
  children?: SidebarItem[];
  lastModified?: string;
}

interface SidebarProps {
  loading?: boolean;
  items: SidebarItem[];
  onChange: (fullTitle: string, item: SidebarItem) => void;
  onRename: (newFileName: string, item: SidebarItem) => Promise<unknown>;
  onDelete: (item: SidebarItem) => void;
}

/**
 * 侧边栏
 */
export default function Sidebar(props: SidebarProps) {
  const {items, onChange, onRename, onDelete, loading} = props;
  const {selectedSidebarItem} = useContext(GlobalContext);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renamingItem, setRenamingItem] = useState<SidebarItem>();

  const handleSidebarItemCLick = (fullTitle: string, item: SidebarItem) => {
    if (item.isFolder) {
      return;
    }
    onChange(fullTitle, item);
  };

  const handleRenameBtnClick = (item: SidebarItem) => {
    setRenameModalOpen(true);
    setRenamingItem(item);
  };

  const {runAsync: handleRenameModalConfirm, loading: confirmLoading} =
    useRequest(
      (values: {fileName: string}) =>
        onRename(
          values.fileName,
          renamingItem as SidebarItem
        ) as Promise<unknown>,
      {
        manual: true,
        onSuccess: () => {
          setRenameModalOpen(false);
        },
      }
    );

  const handleDeleteBtnClick = (item: SidebarItem) => {
    Modal.confirm({
      title: `确定要删除 ${item.title} 吗?`,
      onOk: () => onDelete(item),
    });
  };

  const SidebarItemComponent = (props: {
    item: SidebarItem;
    className?: string;
    parentItem?: SidebarItem;
  }) => {
    const {item, className, parentItem} = props;
		const fullTitle = parentItem ? `${parentItem.title}/${item.title}` : item.title
    return (
      <>
        <div
          key={item.id}
          className={`h-10 flex items-center leading-10 border-0 border-t border-solid border-t-[#eff0f5] px-4 hover:bg-[#4688ff] hover:text-white cursor-pointer ${
            item.id === selectedSidebarItem?.id ? "bg-[#4688ff] text-white" : ""
          }
					${className}
						`}
        >
          {item.isFolder ? (
            <FolderOpenOutlined className="mr-1" />
          ) : (
            <FileOutlined className="mr-1" />
          )}
          <div
            className="flex ellipsis-single mr-2 text-inherit flex-1"
            onClick={() => handleSidebarItemCLick(fullTitle, item)}
          >
            {item.title}
          </div>
          {!item.isFolder ? (
            <>
              <EditOutlined onClick={() => handleRenameBtnClick(item)} />
              <DeleteOutlined
                className="ml-2"
                onClick={() => handleDeleteBtnClick(item)}
              />
            </>
          ) : null}
        </div>
        {item.children?.map((child) => {
          return (
            <SidebarItemComponent
              item={child}
              className="pl-8"
              parentItem={item}
            />
          );
        })}
      </>
    );
  };

  return (
    <Spin spinning={loading}>
      {items.map((item: SidebarItem) => {
        return <SidebarItemComponent item={item} />;
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
