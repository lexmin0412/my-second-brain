import {useOssClient} from "@/hooks";
import {GlobalContext} from "@/hooks/context";
import { isMobile } from "@/utils";
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {useRequest} from "ahooks";
import {Button, Card, Divider, Input, message, Popconfirm} from "antd";
import {useEffect, useState} from "react";

export default function Notes() {
  const {ossClient, ossInitModalOpen, initOSSClient, setOssInitModalOpen} =
    useOssClient();

  const {runAsync: batchGetNotes, data} = useRequest(
    (names: string[]) => {
      const promises: Array<() => Promise<any>> = [];
      console.log("names123", names);
      // return Promise.resolve()
      names.forEach((name) => {
        promises.push(() => {
          return ossClient?.getNote(name).then((res) => {
            return {
							name: name,
							content: res.content.toString()
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
              return splitRes[splitRes.length - 1].split(".md")[0];
            })
        );
      }) as Promise<any[]>;
    },
    {
      manual: true,
    }
  );

  const saveNotes = () => {
    ossClient?.putNote(Math.random().toString(), textValue).then(() => {
      refreshSidebarItems();
    });
  };

  useEffect(() => {
    console.log("ossClientossClient", ossClient);
    if (ossClient) {
      refreshSidebarItems();
    }
  }, [ossClient]);

  const [textValue, setTextValue] = useState("");
  const handleChange = (e: any) => {
    setTextValue(e.target.value);
  };

	const {runAsync: handleDelete} = useRequest((name) => {
    return ossClient?.deleteNote(name);
  }, {
		manual: true,
		onSuccess: () => {
			message.success('删除成功')
			refreshSidebarItems();
		},
	});

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
        <div>
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
            <Button type="primary" onClick={saveNotes}>
              保存
            </Button>
          </div>
        </div>

        <div className="mt-6 flex-1 overflow-auto">
          {data?.map((item) => {
            const actions: React.ReactNode[] = [
              <EditOutlined key="edit" />,
              <Popconfirm
                title="确认删除吗？"
                cancelText="取消"
                okButtonProps={{
                  danger: true,
                  children: "删除",
                }}
                onConfirm={() => handleDelete(item.name)}
              >
                <DeleteOutlined key="delete" />
              </Popconfirm>,
            ];
            return (
              <Card id={item.name} className="mb-3" actions={actions}>
                <p>{item.content}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </GlobalContext.Provider>
  );
}
