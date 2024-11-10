import {useOssClient} from "@/hooks";
import {GlobalContext} from "@/hooks/context";
import {isMobile} from "@/utils";
import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {useRequest} from "ahooks";
import {
  Button,
  Divider,
  Drawer,
  Dropdown,
  FloatButton,
  Input,
  message,
  Modal,
} from "antd";
import dayjs from "dayjs";
import {useEffect, useState} from "react";

export default function Notes() {
  const {ossClient, ossInitModalOpen, initOSSClient, setOssInitModalOpen} =
    useOssClient();

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

  const {runAsync: refreshSidebarItems, loading: sidebarLoading} = useRequest(
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
        );
      }) as Promise<any[]>;
    },
    {
      manual: true,
    }
  );

  const resetInput = () => setTextValue("");

  const {runAsync: saveNotes, loading: saveLoading} = useRequest(
    () => {
      return ossClient?.putNote(Math.random().toString(), textValue);
    },
    {
      manual: true,
      onSuccess: () => {
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
    }
  }, [inputDrawerOpen]);

  return (
    <GlobalContext.Provider
      value={{
        ossClient,
      }}
    >
      <div
        className={`${
          isMobile() ? "w-full px-3" : "w-1/2 mx-auto"
        } pt-6 box-border overflow-hidden flex flex-col h-full`}
      >
        {!isMobile() && (
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
              <Button type="primary" loading={saveLoading} onClick={saveNotes}>
                保存
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {data?.map((item, index) => {
            const actions: any[] = [
              {
                key: "edit",
                label: (
                  <div>
                    <EditOutlined key="edit" />
                    <span className="ml-2">编辑</span>
                  </div>
                ),
              },
              {
                key: "delete",
                danger: true,
                label: (
                  <div>
                    <DeleteOutlined
                      key="delete"
                      onClick={() =>
                        Modal.confirm({
                          title: "提示",
                          content: "删除后无法恢复",
                          onOk: () => handleDelete(item.name),
                        })
                      }
                    />
                    <span className="ml-2">删除</span>
                  </div>
                ),
              },
            ];
            return (
              <>
                {index !== 0 ? <Divider /> : null}
                <div key={item.name} className="mb-3 px-4 rounded-lg">
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
            title="新增小记"
            placement="bottom"
            open={inputDrawerOpen}
            height={340}
            onClose={() => {
              setInputDrawerOpen(false);
            }}
            extra={
              <Button
                disabled={!textValue}
                type="primary"
                loading={saveLoading}
                onClick={async () => {
                  await saveNotes();
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
    </GlobalContext.Provider>
  );
}
