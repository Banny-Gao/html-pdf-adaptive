export default (node) =>
  ["THEAD", "TBODY", "TFOOT", "TR", "TD"].includes(node.nodeName)
