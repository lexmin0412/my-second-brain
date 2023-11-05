import {Form, Input, Radio, Select} from "antd";
import {useEffect, useState} from "react";
import ModalEnhancer from "./base/modal-enhancer";
import {SidebarItem} from "./sidebar";

type AddType = "folder" | "file";

export interface AddFileModalOnOkValues {
  fileName: string;
  type: AddType;
}

interface AddFileModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: AddFileModalOnOkValues) => void;
  folderOptions: SidebarItem[];
}

export default function AddFileModal(props: AddFileModalProps) {
  const {open, onCancel, onOk, folderOptions} = props;
  const [form] = Form.useForm();
  const type: "folder" = Form.useWatch("type", form);
  const [currentFolder, setCurrentFolder] = useState("");

  const handleOk = async () => {
    await form.validateFields();
    const {fileName, type} = form.getFieldsValue() as AddFileModalOnOkValues;
    const values: AddFileModalOnOkValues = {
      fileName:
        type == 'file'
          ? `${currentFolder ? `${currentFolder}/` : ""}${fileName}`
          : fileName,
      type,
    };
    onOk(values);
  };

  useEffect(() => {
    if (!open) {
      form.resetFields();
    } else {
      form.setFieldsValue({
        type: "folder",
        fileName: undefined,
      });
    }
  }, [open]);

  const folders = (
    <Select
      value={currentFolder}
      onChange={(newValue) => {
        setCurrentFolder(newValue);
      }}
      style={{
        width: "100px",
      }}
      options={[
        {
          label: "根目录",
          value: "",
        },
        ...folderOptions.map((item)=>{
					return {
						label: item.title,
						value: item.title
					}
				}),
      ]}
    />
  );

  return (
    <ModalEnhancer
      title="新增文档"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      styles={{
        body: {
          paddingTop: "20px",
        },
      }}
    >
      <Form form={form}>
        <Form.Item
          name="type"
          label="类型"
          required
          rules={[
            {
              required: true,
              message: "类型不能为空",
            },
          ]}
        >
          <Radio.Group
            options={[
              {
                value: "folder",
                label: "文件夹",
              },
              {
                value: "file",
                label: "文件",
              },
            ]}
          />
        </Form.Item>
        {type === "folder" ? (
          <Form.Item
            name="fileName"
            label="名称"
            required
            rules={[
              {
                required: true,
                message: "名称不能为空",
              },
            ]}
          >
            <Input type="text" placeholder="请输入名称" />
          </Form.Item>
        ) : (
          <Form.Item
            name="fileName"
            label="名称"
            required
            rules={[
              {
                required: true,
                message: "文件名不能为空",
              },
            ]}
          >
            <Input
              type="text"
              placeholder="请输入文件名"
              addonBefore={folders}
            />
          </Form.Item>
        )}
      </Form>
    </ModalEnhancer>
  );
}
