import { ElementNode, LexicalNode, NodeKey, EditorConfig, SerializedElementNode, Spread } from 'lexical';

export type SerializedLayoutContainerNode = Spread<
  {
    templateColumns: string;
  },
  SerializedElementNode
>;

export class LayoutContainerNode extends ElementNode {
  __templateColumns: string;

  static getType(): string {
    return 'layout-container';
  }

  static clone(node: LayoutContainerNode): LayoutContainerNode {
    return new LayoutContainerNode(node.__templateColumns, node.__key);
  }

  constructor(templateColumns: string, key?: NodeKey) {
    super(key);
    this.__templateColumns = templateColumns;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('div');
    dom.style.display = 'grid';
    dom.style.gridTemplateColumns = this.__templateColumns;
    dom.style.gap = '16px';
    dom.style.margin = '16px 0';
    const className = config.theme.layoutContainer;
    if (className) {
      dom.className = className;
    }
    return dom;
  }

  updateDOM(prevNode: LayoutContainerNode, dom: HTMLElement): boolean {
    if (prevNode.__templateColumns !== this.__templateColumns) {
      dom.style.gridTemplateColumns = this.__templateColumns;
    }
    return false;
  }

  canBeEmpty(): boolean {
    return true;
  }

  exportJSON(): SerializedLayoutContainerNode {
    return {
      ...super.exportJSON(),
      templateColumns: this.__templateColumns,
      type: 'layout-container',
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedLayoutContainerNode): LayoutContainerNode {
    const node = $createLayoutContainerNode(serializedNode.templateColumns);
    return node;
  }
}

export function $createLayoutContainerNode(templateColumns: string): LayoutContainerNode {
  return new LayoutContainerNode(templateColumns);
}

export function $isLayoutContainerNode(node: LexicalNode | null | undefined): node is LayoutContainerNode {
  return node instanceof LayoutContainerNode;
}
