import {Modal, Form, Input, ModalProps} from "antd";
import { useEffect } from "react";

interface FileRenameModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: {fileName: string}) => void;
  initialValues: {
    fileName: string;
  };
  okButtonProps?: ModalProps['okButtonProps']
}

/**
 * 文件重命名弹窗
 */
export default function FileRenameModal(props: FileRenameModalProps) {
  const {open, onCancel, onOk, initialValues, okButtonProps} = props;
  const [form] = Form.useForm();

  const handleOk = async () => {
    await form.validateFields();
    onOk(form.getFieldsValue());
  };

	useEffect(() => {
    form.setFieldsValue({
      ...initialValues,
    });
  }, [initialValues]);

  return (
    <Modal
      title="修改文件名"
      open={open}
      onCancel={onCancel}
      okButtonProps={okButtonProps}
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
