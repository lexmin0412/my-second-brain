import {isMobile} from "@/utils";
import {LexminFooter} from "@lexmin0412/wc-react";
import {Button, Col, message, Row, Space} from "antd";
import {useHistory, Link} from "pure-react-router";

const FeatureList = [
  {
    link: "/docs",
    title: "文章",
    icon: "🎯",
    description:
      "用于书写体系化的文章，支持代码块、图片等完整的 Markdown 语法。",
  },
  {
    link: "/notes",
    title: "小记",
    icon: "🚀",
    description:
      "记录一瞬间的想法，快速记录免遗忘，方便后续查找并可以扩充成文章。",
  },
];

export default function Home() {
  const history = useHistory();

  return (
    <div className="overflow-hidden h-full ">
      <div
        className={`${
          isMobile() ? "w-full px-3" : "w-3/5 mx-auto"
        } text-center pt-10 pb-4 box-border overflow-auto`}
        style={{
          height: "calc(100% - 64px)",
        }}
      >
        <img
          src="https://lexmin.oss-cn-hangzhou.aliyuncs.com/statics/common/24385370.jpeg"
          className="w-36 h-36  rounded-[50%]"
        />

        <div className="text-3xl mt-6 font-bold">My Second Brain</div>

        <div className="text-lg mt-6">
          一个记录一切的 Markdown 编辑器，做你的第二大脑。
        </div>

        <div className="mt-8">
          <Space size="large">
            <Button
              type="default"
              className="h-10 w-32 rounded-3xl"
              onClick={() => {
                message.info("文档完善中，敬请期待");
              }}
            >
              介绍
            </Button>
            <Button
              type="primary"
              className="h-10 w-32 rounded-3xl"
              onClick={() => {
                history.push("/docs");
              }}
            >
              现在开始
            </Button>
          </Space>
        </div>

        <Row className="mt-12 flex items-center">
          {FeatureList.map((item) => {
            return (
              <Col key={item.title} span={isMobile() ? 24 : 12} className='mb-3'>
                <Link
                  to={item.link}
                  className="bg-[#F9F9F9] mx-3 rounded-2xl p-4 cursor-pointer inline-block text-[#222]"
                >
                  <div className="text-3xl">{item.icon}</div>
                  <div className="mt-3 text-base font-bold">{item.title}</div>
                  <div className="mt-3">{item.description}</div>
                </Link>
              </Col>
            );
          })}
        </Row>
      </div>

      <LexminFooter />
    </div>
  );
}
