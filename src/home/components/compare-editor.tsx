import { MarkdownEditorProps } from "@/utils/editor-plugins";
import Markdown from "react-markdown";

interface CompareEditorProps {
  contentList: Array<{
    title: string;
    content: string;
  }>;
}

export default function CompareEditor(props: CompareEditorProps) {

	const { contentList } = props

	return (
    <div className="flex items-start py-4 h-[65vh] overflow-auto">
      {
				contentList.map((item)=>{
					return (
            <div className={`flex-1`}>
              <div className="font-semibold text-base">{item.title}</div>
              <div>
                <Markdown
                  className="flex-1 p-4 overflow-auto markdown-body"
                  {...MarkdownEditorProps}
                >
									{item.content}
								</Markdown>
              </div>
            </div>
          );
				})
			}
    </div>
  );
}
