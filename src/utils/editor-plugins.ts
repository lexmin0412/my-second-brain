import reactGFM from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from 'rehype-raw'

// 语法插件
export const remarkPlugins = [reactGFM];
// 高亮插件
export const rehypePlugins = [rehypeRaw, rehypeHighlight];

export const MarkdownEditorProps = {
	remarkPlugins,
	rehypePlugins,
}
