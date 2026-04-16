import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';

import { DecoratorNode } from 'lexical';
import * as React from 'react';
import { Suspense } from 'react';

const ImageComponent = React.lazy(() => import('./ImageComponent'));

export type ImageAlignment = 'left' | 'right' | 'center';

export interface ImagePayload {
  altText: string;
  key?: NodeKey;
  src: string;
  alignment?: ImageAlignment;
  width?: 'inherit' | number;
  height?: 'inherit' | number;
}

export type SerializedImageNode = Spread<
  {
    altText: string;
    src: string;
    alignment: ImageAlignment;
    width?: 'inherit' | number;
    height?: 'inherit' | number;
  },
  SerializedLexicalNode
>;

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src } = domNode;
    const alignment = domNode.getAttribute('data-alignment') as ImageAlignment || 'center';
    const width = domNode.getAttribute('width') ? parseInt(domNode.getAttribute('width')!, 10) : 'inherit';
    const height = domNode.getAttribute('height') ? parseInt(domNode.getAttribute('height')!, 10) : 'inherit';
    const node = $createImageNode({ altText, src, alignment, width, height });
    return { node };
  }
  return null;
}

export class ImageNode extends DecoratorNode<React.JSX.Element> {
  __src: string;
  __altText: string;
  __alignment: ImageAlignment;
  __width: 'inherit' | number;
  __height: 'inherit' | number;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__alignment,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, src, alignment, width, height } = serializedNode;
    const node = $createImageNode({
      altText,
      src,
      alignment,
      width,
      height,
    });
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    element.setAttribute('data-alignment', this.__alignment);
    if (this.__width !== 'inherit') {
      element.setAttribute('width', this.__width.toString());
    }
    if (this.__height !== 'inherit') {
      element.setAttribute('height', this.__height.toString());
    }
    
    let style = 'max-width: 100%;';
    if (this.__width === 'inherit') {
      style += ' width: 100%;';
    }
    if (this.__height === 'inherit') {
      style += ' height: auto;';
    }
    if (this.__alignment === 'left') {
      style += ' float: left; margin-right: 1rem; margin-bottom: 1rem;';
    } else if (this.__alignment === 'right') {
      style += ' float: right; margin-left: 1rem; margin-bottom: 1rem;';
    } else {
      style += ' display: block; margin: 0 auto;';
    }
    element.setAttribute('style', style);
    
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  constructor(
    src: string,
    altText: string,
    alignment: ImageAlignment,
    width?: 'inherit' | number,
    height?: 'inherit' | number,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__alignment = alignment;
    this.__width = width || 'inherit';
    this.__height = height || 'inherit';
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      src: this.getSrc(),
      alignment: this.getAlignment(),
      width: this.__width,
      height: this.__height,
      type: 'image',
      version: 1,
    };
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  getAlignment(): ImageAlignment {
    return this.__alignment;
  }

  setAlignment(alignment: ImageAlignment): void {
    const writable = this.getWritable();
    writable.__alignment = alignment;
  }

  setWidthAndHeight(width: 'inherit' | number, height: 'inherit' | number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): React.JSX.Element {
    return (
      <Suspense fallback={null}>
        <ImageComponent
          src={this.__src}
          altText={this.__altText}
          nodeKey={this.getKey()}
          alignment={this.__alignment}
          width={this.__width}
          height={this.__height}
        />
      </Suspense>
    );
  }
}

export function $createImageNode({
  altText,
  src,
  alignment = 'center',
  width,
  height,
  key,
}: ImagePayload): ImageNode {
  return new ImageNode(src, altText, alignment, width, height, key);
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}
