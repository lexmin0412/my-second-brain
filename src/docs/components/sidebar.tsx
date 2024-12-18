import {Modal, Spin} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  FileOutlined,
  DownOutlined,
  UpOutlined,
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
  fullTitle: string;
  /**
   * 是否文件夹
   */
  isFolder: boolean;
  /**
   * 子节点
   */
  children?: SidebarItem[];
  lastModified?: string;
  name: string;
}

interface SidebarProps {
  loading?: boolean;
  items: SidebarItem[];
  showActionButtons?: boolean;
  onChange: (fullTitle: string, item: SidebarItem) => void;
  onRename: (newFileName: string, item: SidebarItem) => Promise<unknown>;
  onDelete: (item: SidebarItem) => void;
}

/**
 * 侧边栏
 */
export default function Sidebar(props: SidebarProps) {
  const {
    items,
    onChange,
    onRename,
    onDelete,
    loading,
    showActionButtons = true,
  } = props;
  const {selectedSidebarItem} = useContext(GlobalContext);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renamingItem, setRenamingItem] = useState<SidebarItem>();
  const [openFolderKeys, setOpenFolderKeys] = useState<string[]>([]);

  const handleSidebarItemCLick = (fullTitle: string, item: SidebarItem) => {
    if (item.isFolder) {
      const openedIndex = openFolderKeys.findIndex((ele) => ele === item.id);
      if (openedIndex > -1) {
        const newList = [...openFolderKeys];
        newList.splice(openedIndex, 1);
        setOpenFolderKeys(newList);
      } else {
        setOpenFolderKeys([...openFolderKeys, item.id]);
      }
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
    const fullTitle = parentItem
      ? `${parentItem.title}/${item.title}`
      : item.title;
    const isFolderOpen = openFolderKeys.includes(item.id);
		console.log("itemitem", item);
    return (
      <>
        <div
          key={item.id}
          className={`h-10 flex items-center leading-10 m-2 pr-4 text-[#222] hover:bg-theme hover:text-white cursor-pointer rounded ${
            item.id === selectedSidebarItem?.id ? "bg-[#4688ff] text-white" : ""
          } ${className}`}
        >
          {item.isFolder ? (
            <FolderOpenOutlined className="mr-1" />
          ) : (
            <FileOutlined className="mr-1" />
          )}
          <div
            className="flex ellipsis-single mr-2 text-inherit flex-1"
            onClick={() => handleSidebarItemCLick(fullTitle, item)}
            title={item.title}
          >
            {item.title}
          </div>
          {item.isFolder ? (
            <>
              {isFolderOpen ? (
                <UpOutlined className="mr-2" />
              ) : (
                <DownOutlined className="mr-2" />
              )}
            </>
          ) : null}
          {showActionButtons ? (
            <>
              <EditOutlined onClick={() => handleRenameBtnClick(item)} />
              <DeleteOutlined
                className="ml-2"
                onClick={() => handleDeleteBtnClick(item)}
              />
            </>
          ) : null}
        </div>
        {isFolderOpen
          ? item.children?.map((child) => {
              return (
                <SidebarItemComponent
                  item={child}
                  className="pl-6"
                  parentItem={item}
                />
              );
            })
          : null}
      </>
    );
  };

	console.log("itemsitems", items);

  return (
    <div className="flex-1 overflow-auto">
      {items.map((item: SidebarItem) => {
        return (
            <SidebarItemComponent item={item} className="pl-2" />
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
    </div>
  );
}
