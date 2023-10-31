interface SidebarItem {
  id: string;
  title: string;
}

interface SidebarProps {
  items: SidebarItem[];
}

export default function Sidebar(props: SidebarProps) {
  const {items} = props;

  return (
    <div>
      {items.map((item) => {
        return <div key={item.id}
					className='h-10 leading-10 border-0 border-t border-solid border-t-[#eff0f5] px-4 hover:bg-[#4688ff] hover:text-white cursor-pointer'
				>{item.title}</div>;
      })}
    </div>
  );
}
