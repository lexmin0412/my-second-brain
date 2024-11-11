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
      console.log("names123", list);
      // return Promise.resolve()
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

  console.log("dat111a", data);

  const {runAsync: refreshSidebarItems} = useRequest(
    () => {
      return ossClient?.listNotes().then((res) => {
        batchGetNotes(
          res.objects
            .filter((item) => item.name.endsWith(".md"))
            .map((item) => {
              const splitRes = item.name.split("/");
              console.log(
                "result111",
                splitRes[splitRes.length - 1].split(".md")[0]
              );
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
  const handleChange = (e: any) => {
    setTextValue(e.target.value);
  };

  const handleCreateTextChange = (e: any) => {
    setCreateTextValue(e.target.value);
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
          isMobile() ? "w-full px-3" : "w-1/2 mx-auto pt-6"
        } box-border overflow-hidden flex flex-col h-full`}
      >
        {!isMobile() && (
          <div className="mb-6">
            <Input.TextArea
              value={createTextValue}
              placeholder="现在的想法是..."
              autoSize={{
                minRows: 3,
                maxRows: 5,
              }}
              onChange={handleCreateTextChange}
            />
            <div className="flex justify-end mt-3">
              <Button
                type="primary"
                loading={saveLoading && !currentId}
                onClick={() =>
                  saveNotes(createTextValue, Math.random().toString())
                }
              >
                保存
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto pb-12 pt-6">
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
              <>
                {index !== 0 ? <Divider /> : null}
                {currentId === item.name && !isMobile() ? (
                  <div className="mb-6">
                    <Input.TextArea
                      value={textValue}
                      placeholder="现在的想法是..."
                      autoSize={{
                        minRows: 6,
                        maxRows: 10,
                      }}
                      onChange={handleChange}
                    />
                    <div className="flex justify-end mt-3">
                      <Space>
                        <Button
                          onClick={() => {
                            setTextValue("");
                            setCurrentId("");
                          }}
                        >
                          取消
                        </Button>
                        <Button
                          type="primary"
                          loading={saveLoading && !!currentId}
                          onClick={() => {
                            saveNotes(textValue, item.name);
                          }}
                        >
                          保存
                        </Button>
                      </Space>
                    </div>
                  </div>
                ) : (
                  <div key={item.name} className="mb-3 px-4">
                    <div className="flex item-center">
                      <div className="flex-1 overflow-hidden text-gray-500 text-sm">
                        {item.lastModified}
                      </div>
                      <Dropdown placement="bottomRight" menu={{items: actions}}>
                        <MoreOutlined className="cursor-pointer text-lg" />
                      </Dropdown>
                    </div>
                    <div className="break-all mt-3 text-[#333]">
                      {item.content}
                    </div>
                  </div>
                )}
              </>
            );
          })}
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
