import {Checkbox, Form} from "antd";
import {useEffect} from "react";
import ModalEnhancer from "./base/modal-enhancer";

export interface LayoutVisibleConfig {
  editor: boolean;
  preview: boolean;
  sidebar: boolean;
}

export interface SettingModalOnOkValues {
  visible: LayoutVisibleConfig;
}

interface SettingModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: SettingModalOnOkValues) => void;
  initialValues: {
    visible: LayoutVisibleConfig;
  };
}

export default function SettingModal(props: SettingModalProps) {
  const {open, onCancel, onOk, initialValues} = props;
  const [form] = Form.useForm();

  const handleOk = async () => {
    await form.validateFields();
		const visible = form.getFieldValue('visible')
		const result: {
      visible: LayoutVisibleConfig;
    } = {
      visible: {
        sidebar: visible?.includes("sidebar"),
        editor: visible?.includes("editor"),
        preview: visible?.includes("preview"),
      },
    };
    onOk(result);
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

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        visible: Object.keys(initialValues.visible).filter(
          (key) => initialValues.visible[key as keyof LayoutVisibleConfig]
        ),
      });
    }
  }, [open]);

  return (
    <ModalEnhancer
      title="设置"
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
        <Form.Item name="visible" label="显示">
          <Checkbox.Group>
            <Checkbox value="sidebar">侧边栏</Checkbox>
            <Checkbox value="editor">编辑器</Checkbox>
            <Checkbox value="preview">预览</Checkbox>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </ModalEnhancer>
  );
}
