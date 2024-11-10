import {
  CarryOutOutlined,
  GithubOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import {Space, Tabs} from "antd";
import {Link, useHistory} from "pure-react-router";

export default function LayoutHeader() {
  const history = useHistory();
  const currentTab = history.location.pathname.split('?')[0];

  return (
    <div className=" h-16 flex items-center justify-between border-0 border-b border-solid border-b-[#eff0f5] px-6 w-full box-border bg-white">
      {/* 左侧logo */}
      <div
        className="flex items-center cursor-pointer"
        onClick={() => {
          history.push("/home");
        }}
      >
        <img
          className="block w-8 h-8 rounded-2xl"
          src="https://lexmin.oss-cn-hangzhou.aliyuncs.com/statics/common/24385370.jpeg"
        />
        <div className="font-semibold ml-2">My Second Brain</div>
      </div>
      <div className="flex items-center">
        <Space size='large'>
          {[
            {
              key: "/docs",
              label: "文档",
            },
            {
              key: "/notes",
              label: "小记",
            },
          ].map((item) => {
            const tabClassName =
              item.key === currentTab
                ? "text-theme"
                : "text-[#222]";
            return (
              <Link className={`${tabClassName} cursor-pointer`} to={item.key}>
                {item.label}
              </Link>
            );
          })}
        </Space>
      </div>
      {/* 右侧图标 */}
      <div className="flex items-center">
        <a
          href="https://lexmin0412.github.io/storybook"
          className="font-semibold text-slate-800 flex items-center justify-center ml-4"
          target="_blank"
        >
          <ReadOutlined
            style={{
              fontSize: "28px",
            }}
          />
        </a>
        <a
          href="https://lexmin0412.github.io/todo"
          className="font-semibold text-slate-800 flex items-center justify-center ml-4"
          target="_blank"
        >
          <CarryOutOutlined
            style={{
              fontSize: "28px",
            }}
          />
        </a>
        <a
          href="https://github.com/lexmin0412/my-second-brain"
          className="font-semibold text-slate-800 flex items-center justify-center ml-4"
          target="_blank"
        >
          <GithubOutlined
            style={{
              fontSize: "28px",
            }}
          />
        </a>
      </div>
    </div>
  );
}
