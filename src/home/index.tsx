import { useSidebarItems } from "@/hooks";
import Editor from "./components/editor";
import Sidebar from "./components/sidebar";

export default function Home() {

	const {
		sidebarItems,
		loading
	} = useSidebarItems()

  return (
    <div className="flex flex-col h-screen">
      {/* 头部 */}
      <div className=" h-16 flex items-center justify-between border-0 border-b border-solid border-b-[#eff0f5] px-6">
        <div className="flex items-center">
          <img
            className="block w-8 h-8 rounded-2xl"
            src="https://lexmin.oss-cn-hangzhou.aliyuncs.com/statics/common/24385370.jpeg"
          />
          <div className="cursor-pointer font-semibold ml-2">
            My Second Brain
          </div>
        </div>
        <div>
          <a
            href="https://github.com/lexmin0412/my-second-brain"
            className="font-semibold"
            target="_blank"
          >
            Github
          </a>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex flex-1">
				{/* 侧边栏 */}
        <div className="w-52 border-0 border-r border-solid border-r-[#eff0f5] bg-slate-10 h-full">
					<div className="h-10 leading-10 text-center cursor-pointer hover:bg-[#4688ff] hover:text-white"> + 新建 </div>
					{loading ? "loading" : <Sidebar items={sidebarItems} />}
				</div>

				{/* 内容区 */}
				<div className="flex-1 h-full box-border">
					<Editor />
				</div>
      </div>

      {/* 底部 */}
      <div className="flex items-center justify-center h-16 border-0 border-t border-solid border-t-[#eff0f5] text-center">
        Created and maintained by{" "}
        <a
          href="https://github.com/lexmin0412"
          className="ml-1"
          target="_blank"
        >
          Lexmin0412
        </a>
        .
      </div>
    </div>
  );
}
