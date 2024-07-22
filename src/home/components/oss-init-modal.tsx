import {OssClientInitProps} from "@/utils";
import {Modal, Form, Select, Input, message} from "antd";

interface OSSInitModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: OssClientInitProps) => void;
}

export default function OSSInitModal(props: OSSInitModalProps) {
  const {open, onCancel, onOk} = props;
  const [form] = Form.useForm();

  const handleOk = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
    try {
      const res = await fetch("https://auth.cellerchan.top/guard/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      }).then((res) => res.json());
			if (res?.code === 0) {
				return onOk(res.data);
			} else {
				message.error(res?.message);
			}
    } catch (error) {
			message.error("登录失败")
			console.error("登录失败", error);
    }
  };

  return (
    <Modal
      title="登录"
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
          name="userName"
          label="用户"
          required
          rules={[
            {
              required: true,
              message: "用户名不能为空",
            },
          ]}
        >
          <Input type="text" placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          required
          rules={[
            {
              required: true,
              message: "密码不能为空",
            },
          ]}
        >
          <Input type="text" placeholder="请输入密码" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
