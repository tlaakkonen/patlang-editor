// Shared validation helpers for diagrams / equations
export function analyzeOutputNodes(nodesArr = [], findItemByType) {
  const outputTypeCounts = {}
  const outputNodeInstances = []
  for (const node of nodesArr || []) {
    const t = node.data?.type
    const box = findItemByType ? findItemByType('boxes', t) : null
    const kind = box?.kind
    if (kind === 'output') {
      outputTypeCounts[t] = (outputTypeCounts[t] || 0) + 1
      outputNodeInstances.push({ node, type: t, box })
    }
  }
  const outputTypes = new Set(Object.keys(outputTypeCounts))
  return { outputTypeCounts, outputNodeInstances, outputTypes }
}

export function collectAllNodeInstances(nodesArr = [], findItemByType) {
  return (nodesArr || []).map((n) => ({ node: n, box: findItemByType ? findItemByType('boxes', n.data?.type) : null }))
}

export function nodesHaveMissingInputConnections(instances = [], edgesArr = []) {
  for (const inst of instances) {
    const node = inst.node
    const inputsArr = node.data?.inputs ?? inst.box?.inputs ?? []
    for (let i = 0; i < inputsArr.length; i++) {
      const targetHandleId = `in-${i}`
      const hasEdge = (edgesArr || []).some((e) => e.target === node.id && e.targetHandle === targetHandleId)
      if (!hasEdge) return true
    }
  }
  return false
}
