import { ElementNode, LexicalNode, NodeKey, EditorConfig, SerializedElementNode } from 'lexical';

export type SerializedLayoutItemNode = SerializedElementNode;

export class LayoutItemNode extends ElementNode {
  static getType(): string {
    return 'layout-item';
  }

  static clone(node: LayoutItemNode): LayoutItemNode {
    return new LayoutItemNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('div');
    const className = config.theme.layoutItem;
    if (className) {
      dom.className = className;
    }
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  canBeEmpty(): boolean {
    return true;
  }

  exportJSON(): SerializedLayoutItemNode {
    return {
      ...super.exportJSON(),
      type: 'layout-item',
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedLayoutItemNode): LayoutItemNode {
    return $createLayoutItemNode();
  }
}

export function $createLayoutItemNode(): LayoutItemNode {
  return new LayoutItemNode();
}

export function $isLayoutItemNode(node: LexicalNode | null | undefined): node is LayoutItemNode {
  return node instanceof LayoutItemNode;
}
