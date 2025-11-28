import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const STORAGE_KEY = 'patlang:v1'

const PaletteContext = createContext(null)

export function PaletteProvider({ children, initialSections }) {
  // attempt to load persisted state from localStorage
  function loadPersisted() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return parsed?.data || parsed
    } catch (err) {
      return null
    }
  }

  const persisted = typeof window !== 'undefined' ? loadPersisted() : null

  const [sections, setSections] = useState(persisted?.sections ?? initialSections ?? DEFAULT_SECTIONS)
  // expose nodes so other components (dialogs) can know what nodes exist on the canvas
  const [nodes, setNodes] = useState(persisted?.nodes ?? [])
  // also keep edges in the shared context so canvas state can be saved/loaded per-diagram
  const [edges, setEdges] = useState(persisted?.edges ?? [])

  // debounced save to localStorage
  const saveTimer = useRef(null)
  useEffect(() => {
    // debounce writes
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try {
        const payload = { v: 1, data: { sections, nodes, edges }, updatedAt: Date.now() }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      } catch (err) {
        // ignore quota or serialization errors
      }
    }, 500)

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current)
        saveTimer.current = null
      }
    }
  }, [sections, nodes, edges])

  const findItemByType = useCallback(
    (section, type) => {
      for (const s of sections) {
        if (s.key !== section) continue
        const it = s.items.find((i) => i.type === type)
        if (it) return it
      }
      return null
    },
    [sections],
  )

  const value = {
    sections,
    setSections,
    findItemByType,
    nodes,
    setNodes,
    edges,
    setEdges,
  }

  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
}

export function usePalette() {
  const ctx = useContext(PaletteContext)
  if (!ctx) throw new Error('usePalette must be used within PaletteProvider')
  return ctx
}

export default PaletteContext
