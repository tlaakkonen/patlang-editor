import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import { usePalette } from '../../state/PaletteContext'

const nodeTypes = { custom: CustomNode };

export default function Canvas() {
    const reactFlowWrapper = useRef(null)
    const reactFlowInstance = useRef(null)
    const idCounter = useRef(10)

    const { findItemByType, nodes, setNodes, edges, setEdges, setSections } = usePalette()
    
    const onNodesChange = useCallback(
        (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        [setNodes],
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [setEdges],
    );
    const onConnect = useCallback(
        (params) => {
            // enforce that the wire type of the source handle and target handle match
            const { source, sourceHandle, target, targetHandle } = params || {}
            if (!source || !target) return

            const srcNode = nodes.find((n) => n.id === source)
            const tgtNode = nodes.find((n) => n.id === target)
            if (!srcNode || !tgtNode) return

            // helper to parse handle id like 'out-0' or 'in-1'
            function parseHandle(h) {
                if (!h) return null
                const m = String(h).match(/(in|out)-(\d+)/)
                if (!m) return null
                return { side: m[1], index: parseInt(m[2], 10) }
            }

            const srcHandle = parseHandle(sourceHandle)
            const tgtHandle = parseHandle(targetHandle)
            if (!srcHandle || !tgtHandle) return

            // lookup palette definitions for each node's type
            const srcPalette = findItemByType ? findItemByType('boxes', srcNode.data?.type) : null
            const tgtPalette = findItemByType ? findItemByType('boxes', tgtNode.data?.type) : null
            if (!srcPalette || !tgtPalette) return

            const srcWire = (srcPalette.outputs || [])[srcHandle.index]
            const tgtWire = (tgtPalette.inputs || [])[tgtHandle.index]

            if (!srcWire || !tgtWire) return
            // require exact match
            if (srcWire !== tgtWire) {
                // reject the connection
                return
            }

            // prevent multiple edges connecting to the same input handle
            // allow only one connection per target input handle (target is always an input)
            const alreadyConnected = (edges || []).some((e) => e.target === target && e.targetHandle === targetHandle)
            if (alreadyConnected) {
                // reject: input handle already has a connection
                return
            }

            // allowed: create the edge and style it using the wire color
            const wireColor = (function () {
                const wire = findItemByType ? findItemByType('wires', srcWire) : null
                return wire?.color || undefined
            })()

            setEdges((edgesSnapshot) => addEdge({ ...params, style: { stroke: wireColor, strokeWidth: 3 } }, edgesSnapshot))
        },
        [nodes, findItemByType, edges, setEdges],
    );

    // update connection preview color when a connection is started
    const [connectionLineStyle, setConnectionLineStyle] = useState({})

    const onConnectStart = useCallback(
        (event, { nodeId, handleId, handleType }) => {
            // determine wire type from the source handle
            const srcNode = nodes.find((n) => n.id === nodeId)
            if (!srcNode) return
            const palette = findItemByType ? findItemByType('boxes', srcNode.data?.type) : null
            if (!palette) return

            // handleId expected like 'out-0' or 'in-1'
            const idxMatch = String(handleId).match(/-(\d+)$/)
            if (!idxMatch) return
            const idx = parseInt(idxMatch[1], 10)

            const wireType = handleType === 'source' ? (palette.outputs || [])[idx] : (palette.inputs || [])[idx]
            if (!wireType) return
            const wire = findItemByType ? findItemByType('wires', wireType) : null
            if (!wire) return

            setConnectionLineStyle({ stroke: wire.color, strokeWidth: 3 })
        },
        [nodes, findItemByType],
    )

    const onConnectEnd = useCallback(() => {
        setConnectionLineStyle({})
    }, [])

    function onInit(instance) {
        reactFlowInstance.current = instance
    }

    function onDragOver(event) {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'copy'
    }

    function onDrop(event) {
        event.preventDefault()
        if (!reactFlowWrapper.current || !reactFlowInstance.current) return

        const type = event.dataTransfer.getData('application/x-node-type')
        if (!type) return

        // only allow drops for items defined in the 'boxes' section
        const def = findItemByType ? findItemByType('boxes', type) : null
        if (!def) return

        // Use the react-flow instance helper to map screen pixels to flow coordinates
        const position = reactFlowInstance.current.screenToFlowPosition({ x: event.clientX, y: event.clientY })
        const id = `n_${idCounter.current++}`
        // node data only contains the type; other defaults are resolved by the renderer via the palette
        const newNode = {
            id,
            type: 'custom',
            position,
            data: {
                type: type,
            },
        }

        setNodes((nds) => nds.concat(newNode))
    }

    // Debounced persist: save nodes/edges into the opened diagram after user stops changing
    // the canvas for a short interval. This reduces frequent updates during drags.
    const saveTimer = useRef(null)
    useEffect(() => {
        // clear any pending timer
        if (saveTimer.current) clearTimeout(saveTimer.current)

        // schedule a save after 500ms of inactivity
        saveTimer.current = setTimeout(() => {
            setSections((prev) => {
                if (!prev) return prev
                const diagSection = prev.find((s) => s.key === 'diagrams')
                if (!diagSection) return prev
                const opened = diagSection.items.find((it) => it.opened)
                if (!opened) return prev

                // Only replace the item if nodes/edges differ (shallow reference compare)
                const updatedItems = diagSection.items.map((it) =>
                    it.type === opened.type
                        ? (it.nodes === nodes && it.edges === edges ? it : { ...it, nodes: nodes, edges: edges })
                        : it,
                )

                return prev.map((s) => (s.key === 'diagrams' ? { ...s, items: updatedItems } : s))
            })
        }, 500)

        return () => {
            if (saveTimer.current) {
                clearTimeout(saveTimer.current)
                saveTimer.current = null
            }
        }
    }, [nodes, edges, setSections])

    return (
        <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }} onDragOver={onDragOver} onDrop={onDrop}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onInit={onInit}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                connectionLineStyle={connectionLineStyle}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                panOnScroll={true}
                selectionOnDrag={true}
                panOnDrag={false}
            >
                <Controls />
                <Background />
            </ReactFlow>
        </div>
    )
}
