"use client";
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { HeadingNode, QuoteNode, $createHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, createCommand, LexicalCommand, COMMAND_PRIORITY_EDITOR, $insertNodes, $createParagraphNode } from 'lexical';
import { $patchStyleText, $setBlocksType } from '@lexical/selection';
import { ListNode, ListItemNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageNode, $createImageNode, ImagePayload } from './editor/ImageNode';
import { LayoutContainerNode, $createLayoutContainerNode, $isLayoutContainerNode } from './editor/LayoutContainerNode';
import { LayoutItemNode, $createLayoutItemNode, $isLayoutItemNode } from './editor/LayoutItemNode';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { auth } from '@/lib/firebase';
import { saveCaptainLog, updateCaptainLog } from '@/lib/logUtils';

export const INSERT_IMAGE_COMMAND: LexicalCommand<ImagePayload> = createCommand('INSERT_IMAGE_COMMAND');

// Required Node Registration
const nodes =[
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

function ImagePlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand<ImagePayload>(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const imageNode = $createImageNode(payload);
        $insertNodes([imageNode]);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);
  return null;
}

// LCARS Custom Toolbar
function ToolbarPlugin({ onSave, logTitle, existingId }: { onSave?: (jsonState: string) => Promise<void>, logTitle: string, existingId?: string }) {
  const [editor] = useLexicalComposerContext();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isInsideLayout, setIsInsideLayout] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = selection.anchor.getNode();
          const parentLayoutItem = node.getParents().find($isLayoutItemNode);
          const parentLayoutContainer = node.getParents().find($isLayoutContainerNode);
          setIsInsideLayout(!!parentLayoutItem || !!parentLayoutContainer);
        }
      });
    });
  }, [editor]);

  const deleteLayout = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const node = selection.anchor.getNode();
        const container = node.getParents().find($isLayoutContainerNode);
        if (container) {
          container.remove();
        }
      }
    });
  };

  const addParagraphBelow = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const node = selection.anchor.getNode();
        const container = node.getParents().find($isLayoutContainerNode) || node.getParents().find($isLayoutItemNode);
        
        if (container) {
          const actualContainer = $isLayoutItemNode(container) ? container.getParent() : container;
          if (actualContainer) {
            const newParagraph = $createParagraphNode();
            actualContainer.insertAfter(newParagraph);
            newParagraph.select();
          }
        } else {
          const p = $createParagraphNode();
          const selection = $getSelection();
          if (selection) {
             selection.insertNodes([p]);
          }
        }
      }
    });
  };

  const applyStyle = (styleRecord: Record<string, string>) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, styleRecord);
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType | 'paragraph') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (headingSize === 'paragraph') {
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    
    try {
      const secureUrl = await uploadToCloudinary(file);
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        altText: file.name,
        src: secureUrl,
        alignment: 'center',
      });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      return;
    }
    if (!logTitle.trim()) {
      return;
    }

    setSaving(true);
    try {
      const state = editor.getEditorState();
      const jsonString = JSON.stringify(state.toJSON());
      
      if (onSave) {
        await onSave(jsonString);
      } else if (existingId) {
        await updateCaptainLog(existingId, jsonString, logTitle);
        router.push('/portfolio/' + existingId);
      } else {
        const newId = await saveCaptainLog(jsonString, logTitle, userId);
        router.push('/portfolio/' + newId);
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-[#CC4444] p-2 flex flex-wrap gap-2 items-center min-h-[64px] shrink-0">
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} className="ncars-button text-xs font-okuda">BOLD</button>
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} className="ncars-button text-xs font-okuda">ITALIC</button>
      
      <div className="h-4 w-px bg-sky-800/50 mx-1" />
      
      <button onClick={() => formatHeading('h1')} className="ncars-button text-xs font-okuda">H1</button>
      <button onClick={() => formatHeading('h2')} className="ncars-button text-xs font-okuda">H2</button>
      <button onClick={() => formatHeading('paragraph')} className="ncars-button text-xs bg-slate-600 text-sky-200 font-okuda">[ NORMAL ]</button>
      
      <div className="h-4 w-px bg-sky-800/50 mx-1" />
      
      <button onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} className="ncars-button text-xs font-okuda">UL</button>
      <button onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} className="ncars-button text-xs font-okuda">OL</button>
      
      <div className="h-4 w-px bg-sky-800/50 mx-1" />

      <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} className="ncars-button text-xs font-okuda">LEFT</button>
      <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')} className="ncars-button text-xs font-okuda">CENTER</button>
      <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')} className="ncars-button text-xs font-okuda">RIGHT</button>

      <div className="h-4 w-px bg-sky-800/50 mx-1" />

      <button onClick={() => {
        editor.update(() => {
          const container = $createLayoutContainerNode('1fr 1fr');
          const item1 = $createLayoutItemNode();
          const item2 = $createLayoutItemNode();
          item1.append($createParagraphNode());
          item2.append($createParagraphNode());
          container.append(item1, item2);
          $insertNodes([container]);
        });
      }} className="ncars-button text-xs">2 COL</button>

      <button onClick={() => {
        editor.update(() => {
          const container = $createLayoutContainerNode('1fr 1fr 1fr');
          const item1 = $createLayoutItemNode();
          const item2 = $createLayoutItemNode();
          const item3 = $createLayoutItemNode();
          item1.append($createParagraphNode());
          item2.append($createParagraphNode());
          item3.append($createParagraphNode());
          container.append(item1, item2, item3);
          $insertNodes([container]);
        });
      }} className="ncars-button text-xs">3 COL</button>

      <button onClick={addParagraphBelow} className="ncars-button text-xs bg-sky-900 border-sky-700">
        [ ADD PARAGRAPH BELOW ]
      </button>

      {isInsideLayout && (
        <button onClick={deleteLayout} className="ncars-button text-xs bg-red-800 text-sky-200 hover:bg-red-900 border-red-800">
          [ DELETE LAYOUT ]
        </button>
      )}

      <div className="h-4 w-px bg-sky-800/50 mx-1" />

      <select onChange={(e) => applyStyle({ 'font-family': e.target.value })} className="bg-black border border-sky-800 text-sky-200 text-xs p-1 outline-none">
        <option value="">Font Family</option>
        <option value="Arial">Arial</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Trebuchet MS">Trebuchet MS</option>
        <option value="Verdana">Verdana</option>
        <option value="Antonio">Antonio</option>
        <option value="Space Mono">Space Mono</option>
        <option value="Roboto">Roboto</option>
        <option value="Open Sans">Open Sans</option>
        <option value="Lato">Lato</option>
        <option value="Montserrat">Montserrat</option>
        <option value="Oswald">Oswald</option>
        <option value="Source Code Pro">Source Code Pro</option>
        <option value="Galaxy">Galaxy (Starfleet)</option>
      </select>

      <input type="color" onChange={(e) => applyStyle({ color: e.target.value })} className="w-8 h-8 bg-black border border-sky-800 cursor-pointer" title="Text Color" />
      
      <label className="ncars-button text-xs cursor-pointer bg-slate-700 text-sky-200 hover:bg-sky-800">
        {uploading ? "UPLOADING..." : "UPLOAD MEDIA"}
        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
      </label>

      <div className="flex-1 min-w-[20px]" />

      <button onClick={handleSave} disabled={saving} className={`ncars-button text-xs bg-orange-700 font-bold hover:bg-orange-600 shadow-[0_0_10px_rgba(194,65,12,0.5)] ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
        [ {saving ? "SAVING..." : "SAVE LOG"} ]
      </button>
    </div>
  );
}

export default function LexicalEditor({ onSave, initialState, existingId, logTitle = "" }: { onSave?: (jsonState: string) => Promise<void>, initialState?: string, existingId?: string, logTitle?: string }) {
  const [title, setTitle] = useState(logTitle);

  const initialConfig = {
    namespace: 'NCARSEditor',
    theme,
    nodes,
    editorState: initialState || undefined,
    onError: (error: Error) => console.error(error),
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase font-mono tracking-widest text-[#9CB4CC]">Log Title / Identifier</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ENTER TITLE..."
          className="bg-black border border-sky-800 text-[#9CB4CC] p-3 text-sm focus:border-orange-700 outline-none uppercase font-okuda tracking-widest"
        />
      </div>

      <LexicalComposer initialConfig={initialConfig}>
        <div className="border border-sky-800 bg-black/80 relative rounded-md flex flex-col min-h-0">
          <ToolbarPlugin onSave={onSave} logTitle={title} existingId={existingId} />
          <div className="relative p-4 min-h-[500px] text-sm overflow-y-auto custom-scrollbar">
            <RichTextPlugin
              contentEditable={<ContentEditable className="outline-none min-h-[400px]" />}
              placeholder={<div className="absolute top-4 left-4 text-sky-800/50 pointer-events-none">Awaiting input...</div>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <ListPlugin />
            <ImagePlugin />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}
