import { GlobalContext } from "@/hooks/context";
import { useContext } from "react";

export interface SidebarItem {
  id: string;
  title: string;
}

interface SidebarProps {
  items: SidebarItem[];
  onChange: (item: SidebarItem) => void
}

/**
 * 侧边栏
 */
export default function Sidebar(props: SidebarProps) {
	const {items, onChange} = props;
	const {
		selectedSidebarItem
	} = useContext(GlobalContext)

	const handleSidebarItemCLick = (item: SidebarItem) => {
		onChange(item);
	}

  return (
    <div>
      {items.map((item: SidebarItem) => {
        return (
          <div
            key={item.id}
            className={`h-10 leading-10 border-0 border-t border-solid border-t-[#eff0f5] px-4 hover:bg-[#4688ff] hover:text-white cursor-pointer ${
              item.id === selectedSidebarItem?.id
                ? "bg-[#4688ff] text-white"
                : ""
            }`}
            onClick={() => handleSidebarItemCLick(item)}
          >
            {item.title}
          </div>
        );
      })}
    </div>
  );
}
