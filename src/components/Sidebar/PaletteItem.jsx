import React from 'react'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { usePalette } from '../../state/PaletteContext'

export default function PaletteItem({ item, sectionKey, onEdit }) {
  const { sections, setSections, nodes, edges, setNodes, setEdges } = usePalette()
  const isOpened = sectionKey === 'diagrams' && !!item.opened

  function onDelete(e) {
    // prevent the delete click from starting a drag or selecting the item
    e.stopPropagation()
    if (!sectionKey) return
    // Prevent deleting a diagram that is currently opened (button should be disabled)
    if (isOpened) return
    setSections((prev) =>
      prev.map((s) => (s.key === sectionKey ? { ...s, items: s.items.filter((it) => it.type !== item.type) } : s)),
    )
  }
  function handleEdit(e) {
    // prevent edit click from starting a drag or selecting the item
    e.stopPropagation()
    if (onEdit) onEdit(e)
  }
  
  function onDragStart(e) {
    // set a custom mime type so Canvas can read the node type
    e.dataTransfer.setData('application/x-node-type', item.type)
    e.dataTransfer.effectAllowed = 'copy'
  }
  function handleDoubleClick(e) {
    // prevent double-click from starting a drag or selecting the item
    e.stopPropagation()
    if (sectionKey !== 'diagrams') return
    // first persist the current canvas into whichever diagram is currently opened
    setSections((prev) =>
      prev.map((s) =>
        s.key === 'diagrams'
          ? { ...s, items: s.items.map((it) => (it.opened ? { ...it, nodes: nodes, edges: edges } : it)) }
          : s,
      ),
    )
    // set the clicked diagram to opened and clear opened on all other diagrams
    setSections((prev) =>
      prev.map((s) =>
        s.key === 'diagrams'
          ? { ...s, items: s.items.map((it) => ({ ...it, opened: it.type === item.type })) }
          : s,
      ),
    )
    // load the diagram's stored canvas state (if any) into the shared canvas state
    // if the diagram has no stored nodes/edges, clear the canvas
    setNodes(item.nodes || [])
    setEdges(item.edges || [])
  }

  return (
    <ListItem
      draggable
      onDragStart={onDragStart}
      onDoubleClick={handleDoubleClick}
      sx={{
        borderRadius: 1,
  bgcolor: isOpened ? 'action.selected' : 'inherit',
  border: isOpened ? '1px solid rgba(25,118,210,0.24)' : 'none',
      }}
      secondaryAction={
      <>
        <IconButton edge="end" aria-label="edit" onClick={handleEdit} sx={{ mr: 1 }}>
          <EditIcon fontSize="small" />
        </IconButton>
        {isOpened ? (
          <Tooltip title="Cannot delete the open diagram">
            <span>
              <IconButton edge="end" aria-label="delete" disabled>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <IconButton edge="end" aria-label="delete" onClick={onDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </>
    }>
      {/* color swatch on the left; only for wires or boxes */}
      {(sectionKey === 'wires' || sectionKey === 'boxes') && (
        <Box
          sx={{
            width: 14,
            height: 14,
            borderRadius: 1,
            backgroundColor: item.color || 'transparent',
            mr: 1,
            border: item.color ? '1px solid rgba(0,0,0,0.12)' : 'none',
            pointerEvents: 'none',
          }}
        />
      )}
      {/* for diagrams that are opened in the canvas, show a small icon swatch on the left (same size as wire/box swatches) */}
      {isOpened && (
        <Box
          sx={{
            width: 14,
            height: 14,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1,
            pointerEvents: 'none',
          }}
        >
          <VisibilityIcon sx={{ width: 12, height: 12, color: 'primary.main' }} />
        </Box>
      )}
      <ListItemText primary={item.label} />
      {/* No snackbar: deletion is disabled and tooltip explains why when a diagram is opened */}
    </ListItem>
  )
}
