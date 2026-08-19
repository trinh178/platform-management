export function findTreeNode<T>(
  nodes: T[],
  predicate: (node: T) => boolean,
  getChildren: (node: T) => T[] | undefined,
): T | undefined {
  for (const node of nodes) {
    if (predicate(node)) return node;
    const found = findTreeNode(getChildren(node) ?? [], predicate, getChildren);
    if (found) return found;
  }
}
