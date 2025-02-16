import {OssClientInitProps} from "@/utils";
import {Modal, Form, Select, Input, message, Tabs} from "antd";
import {useState} from "react";

interface OSSInitModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: OssClientInitProps) => void;
}

enum LoginTypeEnum {
  account = "account",
  secret = "secret",
}

const LoginTypes = [
  {
    key: "account",
    label: "账号密码",
  },
  {
    key: "secret",
    label: "密钥",
  },
];

export default function OSSInitModal(props: OSSInitModalProps) {
  const {open, onCancel, onOk} = props;
  const [form] = Form.useForm();
  const [loginType, setLoginType] = useState<LoginTypeEnum>(
    LoginTypeEnum.account
  );

  const handleOk = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
		if (loginType === LoginTypeEnum.secret) {
			return onOk(values);
		}
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
      message.error("登录失败");
      console.error("登录失败", error);
    }
  };

  return (
    <Modal title="登录" open={open} onCancel={onCancel} onOk={handleOk}>
      <Tabs
        items={LoginTypes}
        activeKey={loginType}
        onChange={(tab) => {
          setLoginType(tab as LoginTypeEnum);
        }}
      />
      <Form form={form}>
        {loginType === LoginTypeEnum.account ? (
          <>
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
          </>
        ) : (
          <>
            <Form.Item
              name="region"
              label="Region"
              required
              rules={[
                {
                  required: true,
                  message: "Region 不能为空",
                },
              ]}
            >
              <Select
                placeholder="请选择"
                options={[
                  {
                    value: "oss-cn-hangzhou",
                    label: "杭州",
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
              <Input type="text" placeholder="请输入 Bucket" />
            </Form.Item>
            <Form.Item
              name="accessKeyId"
              label="AccessKeyId"
              required
              rules={[
                {
                  required: true,
                  message: "AccessKeyId 不能为空",
                },
              ]}
            >
              <Input type="text" placeholder="请输入 AccessKeyId" />
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
          </>
        )}
      </Form>
    </Modal>
  );
}
