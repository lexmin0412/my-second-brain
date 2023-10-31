import {ChangeEvent, useState} from "react";
import Markdown from "react-markdown";

export default function Editor() {
  const [content, setContent] = useState("");

	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setContent(e.target.value)
	}

  return (
    <div className="flex w-full h-full box-border">
      <textarea placeholder="请输入内容开始编辑" className="flex-1 border-0 w-full h-full block outline-none border-r border-solid border-r-[#eff0f5] resize-none p-4 box-border text-base"
				onChange={handleChange}
			/>
      <Markdown className="flex-1 p-4">{content}</Markdown>
    </div>
  );
}
