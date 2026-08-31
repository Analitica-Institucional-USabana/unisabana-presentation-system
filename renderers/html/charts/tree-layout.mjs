// Layout de árbol vertical simplificado, extraído de hierarchies.mjs para
// que renderers/pptx/ pueda reutilizar el mismo cálculo de posiciones sin
// depender de SVG — es una función pura (solo números), nada de dibujo.
// Hojas repartidas en X en orden de aparición, cada padre centrado sobre el
// promedio de sus hijos.
export function layoutTree(root) {
  const nodes = [];
  const edges = [];
  let leafCounter = 0;

  function visit(node, depth, parentId) {
    const id = nodes.length;
    const isLeaf = !node.children || node.children.length === 0;
    let x;
    if (isLeaf) {
      x = leafCounter;
      leafCounter += 1;
    }
    const entry = { id, label: node.label, depth, x: 0, childIds: [] };
    nodes.push(entry);
    if (parentId != null) {
      edges.push([parentId, id]);
      nodes[parentId].childIds.push(id);
    }
    if (isLeaf) {
      entry.x = x;
    } else {
      const childXs = node.children.map((child) => visit(child, depth + 1, id));
      entry.x = childXs.reduce((a, b) => a + b, 0) / childXs.length;
    }
    return entry.x;
  }
  visit(root, 0, null);
  return { nodes, edges, leafCount: Math.max(1, leafCounter) };
}
