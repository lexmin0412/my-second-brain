import { Modal, ModalProps } from "antd";

export default function ModalEnhancer(props: ModalProps) {
	return (
		<Modal
			maskClosable={false}
			{...props}
		/>
	)
}
