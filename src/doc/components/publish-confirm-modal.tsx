import {Modal, Form, Input} from "antd";

interface PublishConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: {
		fileName: string
	}) => void;
}

export default function PublishConfirmModal(props: PublishConfirmModalProps) {
  const {open, onCancel, onOk} = props;
  const [form] = Form.useForm();

  const handleOk = async () => {
    await form.validateFields();
    onOk(form.getFieldsValue());
  };

  return (
    <Modal
      title="发布确认"
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
          name="fileName"
          label="文件名"
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
    </Modal>
  );
}
