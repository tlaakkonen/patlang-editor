import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { usePalette } from '../../state/PaletteContext'

// data: { label, type, color, inputs:[], outputs:[] }
export default function CustomNode({ data }) {
    const { findItemByType } = usePalette()
    const { label, color, inputs, outputs, type } = data || {}

    // try to fill defaults from palette if values are missing
    const paletteItem = type ? findItemByType('boxes', type) : null
    const inputsFinal = inputs || paletteItem?.inputs || []
    const outputsFinal = outputs || paletteItem?.outputs || []
    const colorFinal = color || paletteItem?.color || '#ddd'
    const labelFinal = label || paletteItem?.label || 'node'

    // choose black or white label color based on background for legibility
    function hexToRgb(hex) {
        if (!hex) return null
        let h = hex.replace('#', '').trim()
        if (h.length === 3) h = h.split('').map((c) => c + c).join('')
        if (h.length !== 6) return null
        const int = parseInt(h, 16)
        return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
    }

    function getContrastColor(hex) {
        const rgb = hexToRgb(hex)
        if (!rgb) return '#000'
        // Perceived brightness formula
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
        return brightness > 128 ? '#000' : '#fff'
    }

    const textColor = getContrastColor(colorFinal)

    function handlePosition(index, total) {
        if (total === 1) return '50%'
        const step = 100 / (total + 1)
        return `${step * (index + 1)}%`
    }

    // compute a height so handles have constant vertical spacing
    const maxPorts = Math.max(inputsFinal.length, outputsFinal.length, 1)
    const spacing = 28 // px between handles
    const verticalPadding = 16 // top+bottom padding
    const height = Math.max(48, maxPorts * spacing + verticalPadding)

        return (
            <div className="custom-node" style={{ ['--node-bg']: colorFinal, height: `${height}px`, color: textColor }}>
            {/* left handles (inputs) */}
                {inputsFinal.map((inp, i) => {
                    const wire = findItemByType && findItemByType('wires', inp)
                    const wireColor = wire?.color || undefined
                    return (
                        <Handle
                            key={`in-${i}`}
                            type="target"
                            position={Position.Left}
                            id={`in-${i}`}
                            className="custom-handle custom-handle-left"
                            style={{ top: handlePosition(i, inputsFinal.length), background: wireColor }}
                        />
                    )
                })}

            {/* right handles (outputs) */}
                    {outputsFinal.map((out, i) => {
                        const wire = findItemByType && findItemByType('wires', out)
                        const wireColor = wire?.color || undefined
                        return (
                            <Handle
                                key={`out-${i}`}
                                type="source"
                                position={Position.Right}
                                id={`out-${i}`}
                                className="custom-handle custom-handle-right"
                                style={{ top: handlePosition(i, outputsFinal.length), background: wireColor }}
                            />
                        )
                    })}

            <div className="custom-node-label">{labelFinal}</div>
        </div>
    )
    
}
