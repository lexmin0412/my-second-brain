import { BoldItalicUnderlineToggles, diffSourcePlugin, DiffSourceToggleWrapper, MDXEditor, MDXEditorMethods, UndoRedo, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, toolbarPlugin, markdownShortcutPlugin, codeBlockPlugin, codeMirrorPlugin, ConditionalContents, InsertSandpack, InsertCodeBlock, SandpackConfig, sandpackPlugin, ChangeCodeMirrorLanguage, ShowSandpackInfo, tablePlugin, InsertTable, InsertImage, imagePlugin, linkPlugin } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { Button } from 'antd'
import React, { useEffect } from 'react'

interface IMXEditorProps {
  value: string
  onChange: (markdown: string) => void
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

  const {value, onChange} = props

  const ref = React.useRef<MDXEditorMethods>(null)

  const handleChange = (markdown: string) => {
    console.log('handleChange', markdown)
    onChange(markdown)
  }

  useEffect(()=>{
    ref.current?.setMarkdown(value)
  }, [value])

  return (
    <>
      {/* <Button onClick={() => ref.current?.setMarkdown('new markdown')}>Set new markdown</Button>
      <Button onClick={() => console.log(ref.current?.getMarkdown())}>Get markdown</Button> */}
      <MDXEditor ref={ref} markdown={''} onChange={handleChange}
        plugins={[
          imagePlugin(),
          linkPlugin(),
          tablePlugin(),
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
          sandpackPlugin({ sandpackConfig: simpleSandpackConfig }),
          codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', ts: 'TypeScript', css: 'CSS', json: 'JSON', bash: 'Bash' } }),
          diffSourcePlugin({ diffMarkdown: 'An older version', viewMode: 'rich-text' }),
          toolbarPlugin({
            toolbarClassName: 'my-classname',
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                {' '}
                <UndoRedo />
                <BoldItalicUnderlineToggles />
                <ConditionalContents
            options={[
                { when: (editor) => editor?.editorType === 'codeblock', contents: () => <ChangeCodeMirrorLanguage /> },
                { when: (editor) => editor?.editorType === 'sandpack', contents: () => <ShowSandpackInfo /> },
                { fallback: () => ( <> 
                <InsertCodeBlock />
                <InsertSandpack />
                <InsertTable />
                <InsertCodeBlock />
                <InsertImage />
              </>) }
              ]}
            />,
              </DiffSourceToggleWrapper>
            )
          }),
          markdownShortcutPlugin(),
        ]}
      />
    </>
  )
}