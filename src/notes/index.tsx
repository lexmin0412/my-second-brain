import MdxEditor from "@/docs/components/editor/mdxEditor";
import OSSInitModal from "@/docs/components/oss-init-modal";
import {useOssClient} from "@/hooks";
import {GlobalContext} from "@/hooks/context";
import {isMobile, OssClientInitProps} from "@/utils";
import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {useRequest} from "ahooks";
import OSS from "ali-oss";
import {
  Button,
  Divider,
  Drawer,
  Dropdown,
  FloatButton,
  Input,
  message,
  Modal,
  Space,
} from "antd";
import dayjs from "dayjs";
import {useEffect, useState} from "react";

export default function Notes() {
  const {ossClient, ossInitModalOpen, setOssInitModalOpen, initOSSClient} =
    useOssClient();
  const [currentId, setCurrentId] = useState<string>();
  const [createTextValue, setCreateTextValue] = useState("");

  const {runAsync: batchGetNotes, data} = useRequest(
    (
      list: {
        name: string;
        lastModified: string;
      }[]
    ) => {
      const promises: Array<() => Promise<any>> = [];
      list.forEach((item) => {
        promises.push(() => {
          return ossClient?.getNote(item.name).then((res) => {
            return {
              name: item.name,
              lastModified: item.lastModified,
              content: res.content.toString(),
            };
          });
        });
      });
      return Promise.all(promises.map((item) => item()));
    },
    {
      manual: true,
    }
  );

  const {runAsync: refreshSidebarItems} = useRequest(
    () => {
      return ossClient?.listNotes().then((res) => {
        batchGetNotes(
          res.objects
            .filter((item) => item.name.endsWith(".md"))
            .map((item) => {
              const splitRes = item.name.split("/");
              return {
                name: splitRes[splitRes.length - 1].split(".md")[0],
                lastModified: dayjs(item.lastModified).format(
                  "YYYY-MM-DD HH:mm:ss"
                ),
              };
            })
            .sort((a, b) => {
              if (dayjs(a.lastModified).isBefore(b.lastModified)) {
                return 1;
              }
              return -1;
            })
        );
      }) as Promise<any[]>;
    },
    {
      manual: true,
    }
  );

  const resetInput = () => {
    setTextValue("");
    setCreateTextValue("");
  };

  const {runAsync: saveNotes, loading: saveLoading} = useRequest(
    (textValue: string, filename: string) => {
      return ossClient?.putNote(
        filename,
        textValue
      ) as Promise<OSS.PutObjectResult>;
    },
    {
      manual: true,
      onSuccess: () => {
        setCurrentId("");
        refreshSidebarItems();
        resetInput();
        message.success("保存成功");
      },
    }
  );

  useEffect(() => {
    if (ossClient) {
      refreshSidebarItems();
    }
  }, [ossClient]);

  const [textValue, setTextValue] = useState("");
  const handleChange = (value: string) => {
    setTextValue(value);
  };

  const handleCreateTextChange = (value: string) => {
    setCreateTextValue(value);
  };

  const {runAsync: handleDelete} = useRequest(
    (name) => {
      return ossClient?.deleteNote(name);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success("删除成功");
        refreshSidebarItems();
      },
    }
  );

  const [inputDrawerOpen, setInputDrawerOpen] = useState(false);

  useEffect(() => {
    if (!inputDrawerOpen) {
      setTextValue("");
      setCurrentId("");
    }
  }, [inputDrawerOpen]);

  const handleOssInitModalConfirm = (values: OssClientInitProps) => {
    initOSSClient(values);
    setOssInitModalOpen(false);
  };

  return (
    <GlobalContext.Provider
      value={{
        ossClient,
      }}
    >
      <div
        className={`${
          isMobile() ? "w-full px-3" : "w-1/2 mx-auto"
        } box-border overflow-hidden flex w-full h-full`}
      >
        {/* 桌面端左侧编辑区域 */}
        {!isMobile() && (
          <div className="md:w-1/2 px-6 pb-6 bg-white shadow-sm flex flex-col  overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {currentId ? "编辑笔记" : "新建笔记"}
              </h2>
              <div className="flex justify-end gap-4">
                {currentId && (
                  <Button
                    onClick={() => {
                      setTextValue("");
                      setCurrentId("");
                    }}
                    className="px-3 h-8"
                  >
                    取消
                  </Button>
                )}
                <Button
                  type="primary"
                  loading={saveLoading}
                  disabled={!(currentId ? textValue : createTextValue)}
                  onClick={() => {
                    currentId
                      ? saveNotes(textValue, currentId)
                      : saveNotes(createTextValue, Math.random().toString());
                  }}
                  className="bg-blue-600 hover:!bg-blue-700 px-3 h-8"
                >
                  {currentId ? "保存修改" : "小记一下"}
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto border border-solid border-gray-300 rounded-lg">
              <MdxEditor
                value={currentId ? textValue : createTextValue}
                onChange={currentId ? handleChange : handleCreateTextChange}
                className="min-h-96"
              />
            </div>
          </div>
        )}

        {/* 右侧列表区域 */}
        <div
          className={`${
            isMobile() ? "pt-6" : "md:w-1/2"
          } flex-1 overflow-hidden flex flex-col`}
        >
          {!isMobile() && (
            <h3 className="px-6 py-0 text-xl font-semibold text-gray-800 border-b">
              历史记录 ({data?.length || 0})
            </h3>
          )}
          <div
            className={`${
              isMobile() ? "px-3" : "px-6"
            } overflow-auto flex-1 pb-3`}
          >
            {data?.map((item, index) => {
              const actions: any[] = [
                {
                  key: "edit",
                  label: (
                    <div
                      onClick={() => {
                        setInputDrawerOpen(true);
                        setTextValue(item.content);
                        setCurrentId(item.name);
                      }}
                    >
                      <EditOutlined key="edit" />
                      <span className="ml-2">编辑</span>
                    </div>
                  ),
                },
                {
                  key: "delete",
                  danger: true,
                  label: (
                    <div
                      onClick={() => {
                        Modal.confirm({
                          title: "提示",
                          content: "删除后无法恢复",
                          onOk: () => handleDelete(item.name),
                        });
                      }}
                    >
                      <DeleteOutlined key="delete" />
                      <span className="ml-2">删除</span>
                    </div>
                  ),
                },
              ];
              return (
                <div
                  key={item.name}
                  className={`${isMobile() ? "mb-3" : "mb-4"}`}
                >
                  {index !== 0 && <Divider className="!my-6" />}
                  <div
                    className={`group bg-gray-50 ${
                      !isMobile() && "rounded-lg transition-colors"
                    }`}
                  >
                    <div className="flex items-center justify-between p-3 pb-0">
                      <span className="text-sm text-gray-500">
                        {item.lastModified}
                      </span>
                      <Dropdown menu={{items: actions}}>
                        <MoreOutlined className="cursor-pointer text-lg text-gray-400 hover:text-blue-600" />
                      </Dropdown>
                    </div>
                    <div className="text-gray-800 break-words">
                      <MdxEditor readonly value={item.content} />
                    </div>
                  </div>
                </div>
              );
            })}

            {data?.length && (
              <div className="text-center h-10 leading-10 text-gray-300">
                — — 我是有底线的 — —
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobile() && (
        <>
          <FloatButton
            shape="circle"
            type="primary"
            style={{insetInlineEnd: 30}}
            icon={<PlusOutlined />}
            onClick={() => setInputDrawerOpen(true)}
          />

          <Drawer
            title={currentId ? "编辑小记" : "新增小记"}
            placement="bottom"
            open={inputDrawerOpen}
            height={340}
            style={{padding: 0}}
            onClose={() => {
              setInputDrawerOpen(false);
            }}
            extra={
              <Button
                disabled={!textValue}
                type="primary"
                loading={saveLoading}
                onClick={async () => {
                  await saveNotes(
                    textValue,
                    currentId || Math.random().toString()
                  );
                  setInputDrawerOpen(false);
                }}
              >
                保存
              </Button>
            }
          >
            <Input.TextArea
              value={textValue}
              placeholder="现在的想法是..."
              rows={10}
              onChange={handleChange}
            />
          </Drawer>
        </>
      )}

      <OSSInitModal
        open={ossInitModalOpen}
        onCancel={() => setOssInitModalOpen(false)}
        onOk={handleOssInitModalConfirm}
      />
    </GlobalContext.Provider>
  );
}
