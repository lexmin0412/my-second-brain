import { OssClientInitProps } from "@/utils";
import {Modal, Form, Select, Input} from "antd";

interface OSSInitModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: OssClientInitProps) => void;
}

export default function OSSInitModal(props: OSSInitModalProps) {
  const {open, onCancel, onOk} = props;
	const [form] = Form.useForm()

	const handleOk = async() => {
		await form.validateFields()
		onOk(form.getFieldsValue())
	}

  return (
    <Modal
      title="初始化配置"
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
          name="region"
          label="地域"
          required
          rules={[
            {
              required: true,
              message: "地域不能为空",
            },
          ]}
        >
          <Select
            placeholder="请选择地域"
            options={[
              {
                label: "杭州",
                value: "oss-cn-hangzhou",
              },
              {
                label: "上海",
                value: "oss-cn-shanghai",
              },
              {
                label: "深圳",
                value: "oss-cn-shenzhen",
              },
              {
                label: "北京",
                value: "oss-cn-beijing",
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="bucket"
          label="Bucket"
          required
          rules={[
            {
              required: true,
              message: "Bucket 不能为空",
            },
          ]}
        >
          <Input type="text" placeholder="请输入 Bucket 名" />
        </Form.Item>
        <Form.Item
          name="accessKeyId"
          label="AccesssKeyId"
          required
          rules={[
            {
              required: true,
              message: "AccesssKeyId 不能为空",
            },
          ]}
        >
          <Input type="text" placeholder="请输入 AccesssKeyId" />
        </Form.Item>
        <Form.Item
          name="accessKeySecret"
          label="AccessKeySecret"
          required
          rules={[
            {
              required: true,
              message: "AccessKeySecret 不能为空",
            },
          ]}
        >
          <Input type="text" placeholder="请输入 AccessKeySecret" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
