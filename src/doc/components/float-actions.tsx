import { FloatButton} from "antd";
import {
  PlusOutlined,
  EllipsisOutlined,
	SettingOutlined,
	MenuOutlined,
	LogoutOutlined
} from "@ant-design/icons";
import { isMobile } from "@/utils";
import { ReactNode } from "react";

interface ButtonItem {
	key: string
	icon: ReactNode
	onClick: () => void
	visible: boolean
}

interface FloatActionsProps {
  onAddFile: () => void;
  onSettingBtnClick: () => void;
  onMenuBtnClick: () => void;
}

export default function FloatActions(props: FloatActionsProps) {
  const {onAddFile, onSettingBtnClick, onMenuBtnClick} = props;

	const onLogout = () => {
		localStorage.removeItem("oss-config");
		window.location.reload()
	}

  const buttonList: ButtonItem[] = [
    {
      key: "add-file",
      icon: <PlusOutlined />,
      onClick: onAddFile,
      visible: !isMobile(),
    },
    // 移动端未实现良好交互，暂时不开放视图设置
    {
      key: "setting",
      icon: <SettingOutlined />,
      onClick: onSettingBtnClick,
      visible: !isMobile(),
    },
		{
			key: 'log-out',
			icon: <LogoutOutlined />,
			onClick: onLogout,
			visible: true,
		},
    {
      key: "menu-sidebar",
      icon: <MenuOutlined />,
      onClick: onMenuBtnClick,
      visible: isMobile(),
    },
  ];

	const visibleButtonList = buttonList?.filter(item=>item.visible)

  return (
    <div>
      {/* 浮动按钮 */}
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{right: 24}}
        icon={<EllipsisOutlined />}
      >
        {visibleButtonList.map((button) => {
          return (
            <FloatButton
              key={button.key}
              icon={button.icon}
              onClick={button.onClick}
            />
          );
        })}
      </FloatButton.Group>
    </div>
  );
}
