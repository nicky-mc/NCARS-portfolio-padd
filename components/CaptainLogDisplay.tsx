import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { ImageNode } from './editor/ImageNode';
import { LayoutContainerNode } from './editor/LayoutContainerNode';
import { LayoutItemNode } from './editor/LayoutItemNode';

const nodes = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  ImageNode,
  LayoutContainerNode,
  LayoutItemNode,
];

const theme = {
  paragraph: 'mb-4 text-sky-200',
  text: {
    bold: 'font-bold text-orange-700',
    italic: 'italic',
    underline: 'underline',
  },
  heading: {
    h1: 'text-4xl font-antonio text-orange-700 mb-4',
    h2: 'text-3xl font-antonio text-slate-300 mb-3',
    h3: 'text-2xl font-antonio text-sky-200 mb-2',
    h4: 'text-xl font-antonio text-sky-200 mb-2',
  },
  list: {
    ul: 'list-disc ml-6 mb-4 text-sky-200',
    ol: 'list-decimal ml-6 mb-4 text-sky-200',
    listitem: 'mb-1',
  },
  image: 'editor-image',
  layoutContainer: 'flex gap-4 w-full my-4',
  layoutItem: 'flex-1 border border-sky-800/50 p-2 min-h-[50px]',
};

export default function CaptainLogDisplay({ jsonContent }: { jsonContent: string }) {
  const initialConfig = {
    namespace: 'NCARSLogView',
    theme,
    nodes,
    editable: false,
    editorState: jsonContent,
    onError: (error: Error) => console.error(error),
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative py-4 text-sm font-mono tracking-wide leading-relaxed">
        <RichTextPlugin
          contentEditable={<ContentEditable className="outline-none" />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
    </LexicalComposer>
  );
}
