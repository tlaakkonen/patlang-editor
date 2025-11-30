import React from 'react'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'
import ListSubheader from '@mui/material/ListSubheader'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import { usePalette } from '../../state/PaletteContext'
import PaletteItem from './PaletteItem'
import AddBoxDialog from './AddBoxDialog'
import AddWireDialog from './AddWireDialog'
import AddDiagramDialog from './AddDiagramDialog'
import AddEquationDialog from './AddEquationDialog'

export default function PaletteSection({ title, items = [], sectionKey }) {
  const [open, setOpen] = React.useState(true)
  const { setSections } = usePalette()
  // dialog open state (local to this section)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState(null)

  function toggle() {
    setOpen((v) => !v)
  }

  function onAdd(e) {
    // prevent the add click from toggling the section
    e.stopPropagation()
    if (!sectionKey) return
    // open dialog for creating a new item (no editingItem)
    setEditingItem(null)
    setDialogOpen(true)
  }

  function openEdit(item, e) {
    // open dialog to edit an existing palette item
    if (e && e.stopPropagation) e.stopPropagation()
    setEditingItem(item)
    setDialogOpen(true)
  }
  function handleDialogClose(item) {
    setDialogOpen(false)
    if (!item) return
    if (editingItem) {
      // update existing item (preserve type)
      setSections((prev) =>
        prev.map((s) =>
          s.key === sectionKey
            ? { ...s, items: (s.items || []).map((it) => (it.type === editingItem.type ? { ...it, ...item, type: editingItem.type } : it)) }
            : s,
        ),
      )
    } else {
      // append new item
      setSections((prev) => prev.map((s) => (s.key === sectionKey ? { ...s, items: [...(s.items || []), item] } : s)))
    }
  }

  return (
    <List
      component="nav"
      dense
      disablePadding
    >
      <ListItemButton onClick={toggle} sx={{ pl: 1 }}>
        <ListItemText primary={title} />
        <IconButton edge="end" aria-label={`add-${sectionKey}`} onClick={onAdd} size="small" sx={{ mr: 1 }}>
          <AddIcon fontSize="small" />
        </IconButton>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List disablePadding>
          {items.map((it) => (
            <PaletteItem key={it.type} item={it} sectionKey={sectionKey} onEdit={(e) => openEdit(it, e)} />
          ))}
        </List>
      </Collapse>
      {/* Dialogs for creating new items in this section */}
      {sectionKey === 'boxes' && (
        <AddBoxDialog open={dialogOpen} onClose={handleDialogClose} sectionKey={sectionKey} initialItem={editingItem} />
      )}
      {sectionKey === 'wires' && (
        <AddWireDialog open={dialogOpen} onClose={handleDialogClose} sectionKey={sectionKey} initialItem={editingItem} />
      )}
      {sectionKey === 'diagrams' && (
        <AddDiagramDialog open={dialogOpen} onClose={handleDialogClose} sectionKey={sectionKey} initialItem={editingItem} />
      )}
      {sectionKey === 'equations' && (
        <AddEquationDialog open={dialogOpen} onClose={handleDialogClose} sectionKey={sectionKey} initialItem={editingItem} />
      )}
    </List>
  )
}
