import type { NodeKey } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { $isImageNode, ImageAlignment } from './ImageNode';

function ImageResizer({
  onResizeStart,
  onResize,
  onResizeEnd,
  imageRef,
}: {
  onResizeStart: () => void;
  onResize: (width: number, height: number) => void;
  onResizeEnd: (width: number, height: number) => void;
  imageRef: React.RefObject<HTMLImageElement | null>;
}) {
  const handlePointerDown = (e: React.PointerEvent, direction: string) => {
    e.preventDefault();
    const image = imageRef.current;
    if (!image) return;

    onResizeStart();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = image.getBoundingClientRect().width;
    const startHeight = image.getBoundingClientRect().height;
    const ratio = startWidth / startHeight;

    let currentWidth = startWidth;
    let currentHeight = startHeight;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const diffX = moveEvent.clientX - startX;
      const diffY = moveEvent.clientY - startY;

      if (direction === 'se') {
        currentWidth = startWidth + diffX;
      } else if (direction === 'sw') {
        currentWidth = startWidth - diffX;
      } else if (direction === 'ne') {
        currentWidth = startWidth + diffX;
      } else if (direction === 'nw') {
        currentWidth = startWidth - diffX;
      }

      currentHeight = currentWidth / ratio;

      currentWidth = Math.max(50, currentWidth);
      currentHeight = Math.max(50, currentHeight);

      onResize(currentWidth, currentHeight);
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      onResizeEnd(currentWidth, currentHeight);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <>
      <div className="absolute top-0 left-0 w-3 h-3 bg-sky-800 border border-black cursor-nwse-resize -translate-x-1.5 -translate-y-1.5 z-20" onPointerDown={(e) => handlePointerDown(e, 'nw')} />
      <div className="absolute top-0 right-0 w-3 h-3 bg-sky-800 border border-black cursor-nesw-resize translate-x-1.5 -translate-y-1.5 z-20" onPointerDown={(e) => handlePointerDown(e, 'ne')} />
      <div className="absolute bottom-0 left-0 w-3 h-3 bg-sky-800 border border-black cursor-nesw-resize -translate-x-1.5 translate-y-1.5 z-20" onPointerDown={(e) => handlePointerDown(e, 'sw')} />
      <div className="absolute bottom-0 right-0 w-3 h-3 bg-sky-800 border border-black cursor-nwse-resize translate-x-1.5 translate-y-1.5 z-20" onPointerDown={(e) => handlePointerDown(e, 'se')} />
    </>
  );
}

export default function ImageComponent({
  src,
  altText,
  nodeKey,
  alignment,
  width,
  height,
}: {
  altText: string;
  nodeKey: NodeKey;
  src: string;
  alignment: ImageAlignment;
  width: 'inherit' | number;
  height: 'inherit' | number;
}): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizerWidth, setResizerWidth] = useState<'inherit' | number>(width);
  const [resizerHeight, setResizerHeight] = useState<'inherit' | number>(height);

  const currentWidth = isResizing ? resizerWidth : width;
  const currentHeight = isResizing ? resizerHeight : height;

  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.remove();
        }
      }
      return false;
    },
    [isSelected, nodeKey],
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (payload: MouseEvent) => {
          const event = payload;
          if (event.target === imageRef.current) {
            if (event.shiftKey) {
              setSelected(!isSelected);
            } else {
              clearSelection();
              setSelected(true);
            }
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [clearSelection, editor, isSelected, nodeKey, onDelete, setSelected]);

  const setAlignment = (newAlignment: ImageAlignment) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setAlignment(newAlignment);
      }
    });
  };

  const setWidthPct = (pct: number) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        const editorElement = editor.getRootElement();
        if (editorElement) {
          const maxWidth = editorElement.getBoundingClientRect().width;
          const newWidth = Math.floor(maxWidth * (pct / 100));
          node.setWidthAndHeight(newWidth, 'inherit');
          setResizerWidth(newWidth);
          setResizerHeight('inherit');
        }
      }
    });
  };

  let containerClass = 'relative inline-block';
  if (alignment === 'left') {
    containerClass += ' float-left mr-4 mb-4';
  } else if (alignment === 'right') {
    containerClass += ' float-right ml-4 mb-4';
  } else {
    containerClass += ' block mx-auto my-4 text-center';
  }

  return (
    <span className={containerClass}>
      <div className={`relative inline-block ${isSelected ? 'ring-2 ring-sky-800 shadow-[0_0_15px_rgba(125,211,252,0.3)]' : ''}`}>
        <img
          src={src}
          alt={altText}
          ref={imageRef}
          style={{
            width: currentWidth === 'inherit' ? '100%' : `${currentWidth}px`,
            height: currentHeight === 'inherit' ? 'auto' : `${currentHeight}px`,
            maxWidth: '100%',
          }}
          className="transition-all"
        />
        {isSelected && (
          <ImageResizer
            imageRef={imageRef}
            onResizeStart={() => setIsResizing(true)}
            onResize={(w, h) => {
              setResizerWidth(w);
              setResizerHeight(h);
            }}
            onResizeEnd={(w, h) => {
              setIsResizing(false);
              editor.update(() => {
                const node = $getNodeByKey(nodeKey);
                if ($isImageNode(node)) {
                  node.setWidthAndHeight(w, h);
                }
              });
            }}
          />
        )}
      </div>
      {isSelected && !isResizing && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black border border-sky-800 flex flex-row items-center w-max gap-2 p-1 z-[100] glass-panel rounded-md">
          <div className="flex flex-row gap-1 border-r border-sky-800/50 pr-2 mr-1">
            <button
              onClick={(e) => { e.preventDefault(); setAlignment('left'); }}
              className={`ncars-button whitespace-nowrap px-3 py-1 text-xs ${alignment === 'left' ? 'bg-slate-700 text-sky-200 underline' : 'text-sky-200 hover:bg-sky-800/50'}`}
              title="Align Left"
            >
              [ L ]
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setAlignment('center'); }}
              className={`ncars-button whitespace-nowrap px-3 py-1 text-xs ${alignment === 'center' ? 'bg-slate-700 text-sky-200 underline' : 'text-sky-200 hover:bg-sky-800/50'}`}
              title="Align Center"
            >
              [ C ]
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setAlignment('right'); }}
              className={`ncars-button whitespace-nowrap px-3 py-1 text-xs ${alignment === 'right' ? 'bg-slate-700 text-sky-200 underline' : 'text-sky-200 hover:bg-sky-800/50'}`}
              title="Align Right"
            >
              [ R ]
            </button>
          </div>
          <div className="flex flex-row gap-1">
            <button onClick={(e) => { e.preventDefault(); setWidthPct(25); }} className="ncars-button px-2 py-1 text-[10px] hover:bg-sky-800/50">[ 25% ]</button>
            <button onClick={(e) => { e.preventDefault(); setWidthPct(50); }} className="ncars-button px-2 py-1 text-[10px] hover:bg-sky-800/50">[ 50% ]</button>
            <button onClick={(e) => { e.preventDefault(); setWidthPct(100); }} className="ncars-button px-2 py-1 text-[10px] hover:bg-sky-800/50">[ 100% ]</button>
          </div>
        </div>
      )}
    </span>
  );
}
