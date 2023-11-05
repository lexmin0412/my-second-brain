import { Form, Input, Radio} from "antd";
import {useEffect} from "react";
import ModalEnhancer from "./base/modal-enhancer";

export interface AddFileModalOnOkValues {
  fileName: string;
  type: "folder" | "file";
}

interface AddFileModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: AddFileModalOnOkValues) => void;
}

export default function AddFileModal(props: AddFileModalProps) {
  const {open, onCancel, onOk} = props;
  const [form] = Form.useForm();

  const handleOk = async () => {
    await form.validateFields();
    onOk(form.getFieldsValue());
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

  console.log("form.getFieldsValue", form.getFieldsValue());

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
          <Input type="text" placeholder="请输入文件名" />
        </Form.Item>
      </Form>
    </ModalEnhancer>
  );
}
