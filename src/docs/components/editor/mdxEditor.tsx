import { useOssClient } from '@/hooks'
import { createRandomId } from '@/utils/id'
import { BoldItalicUnderlineToggles, diffSourcePlugin, DiffSourceToggleWrapper, MDXEditor, MDXEditorMethods, UndoRedo, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, toolbarPlugin, markdownShortcutPlugin, codeBlockPlugin, codeMirrorPlugin, ConditionalContents, InsertSandpack, InsertCodeBlock, SandpackConfig, sandpackPlugin, ChangeCodeMirrorLanguage, ShowSandpackInfo, tablePlugin, InsertTable, InsertImage, imagePlugin, linkPlugin, CreateLink, linkDialogPlugin } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { message } from 'antd'
import { useCallback, useEffect, useRef } from 'react'

interface IMXEditorProps {
	className?: string
	readonly?: boolean
  value: string
  onChange?: (markdown: string) => void
}

const defaultSnippetContent = `
export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
`.trim()

const simpleSandpackConfig: SandpackConfig = {
  defaultPreset: 'react',
  presets: [
    {
      label: 'React',
      name: 'react',
      meta: 'live react',
      sandpackTemplate: 'react',
      sandpackTheme: 'light',
      snippetFileName: '/App.js',
      snippetLanguage: 'jsx',
      initialSnippetContent: defaultSnippetContent
    },
  ]
}

export default function MdxEditor(props: IMXEditorProps) {

  const { readonly, value, onChange, className } = props
  const { ossClient } = useOssClient()
  const timerRef = useRef(null);

  const ref = useRef<MDXEditorMethods>(null)

const handleChange = useCallback((markdown: string) => {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
  }
  timerRef.current = setTimeout(() => {
    onChange?.(markdown);
    timerRef.current = null;
  }, 300);
}, [onChange]);

  useEffect(() => {
    if (value !== ref.current?.getMarkdown()) {
      ref.current?.setMarkdown(value)
    }
  }, [value])

  function fileToBlob(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(new Blob([event.target.result], { type: file.type }));
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  const [messageApi, contextHolder] = message.useMessage();

  async function imageUploadHandler(image: File) {
    messageApi.loading('正在上传图片，请稍候...')
    const randomName = createRandomId();
    const blob = await fileToBlob(image)
    const response = await ossClient?.uploadImage(randomName, blob)
    messageApi.destroy()
    return response.url
  }

	const getPlugins = () =>  {
		const plugins = [
      imagePlugin({
        imageUploadHandler,
      }),
      linkPlugin(),
      linkDialogPlugin(),
      tablePlugin(),
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      codeBlockPlugin({defaultCodeBlockLanguage: "js"}),
      sandpackPlugin({sandpackConfig: simpleSandpackConfig}),
      codeMirrorPlugin({
        codeBlockLanguages: {
          js: "JavaScript",
          ts: "TypeScript",
          css: "CSS",
          json: "JSON",
          bash: "Bash",
        },
      }),
      diffSourcePlugin({
        diffMarkdown: "An older version",
        viewMode: "rich-text",
      }),
      markdownShortcutPlugin(),
    ];
		if (!readonly) {
			plugins.push(
        toolbarPlugin({
          toolbarClassName: "my-classname",
          toolbarContents: () => (
            <DiffSourceToggleWrapper>
              {" "}
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <ConditionalContents
                options={[
                  {
                    when: (editor) => editor?.editorType === "codeblock",
                    contents: () => <ChangeCodeMirrorLanguage />,
                  },
                  {
                    when: (editor) => editor?.editorType === "sandpack",
                    contents: () => <ShowSandpackInfo />,
                  },
                  {
                    fallback: () => (
                      <>
                        <InsertCodeBlock />
                        <InsertSandpack />
                        <CreateLink />
                        <InsertTable />
                        <InsertImage />
                      </>
                    ),
                  },
                ]}
              />
              ,
            </DiffSourceToggleWrapper>
          ),
        })
      );
		}
		return plugins
	}

  return (
    <>
      {contextHolder}
      <MDXEditor
        className={className}
        readOnly={readonly}
        ref={ref}
        markdown={''}
        onChange={handleChange}
        plugins={getPlugins()}
      />
    </>
  );
}
