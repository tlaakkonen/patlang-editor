import React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import InputLabel from '@mui/material/InputLabel'
import Button from '@mui/material/Button'
import { MuiColorInput } from 'mui-color-input'

// Blank dialog for creating a wire item. Returns a default item on Add.
export default function AddWireDialog({ open, onClose, sectionKey, initialItem = null }) {
  const [label, setLabel] = React.useState('New Wire')
  const [color, setColor] = React.useState('#222222')

  React.useEffect(() => {
    if (open) {
      // if editing, populate with initial values; otherwise reset to defaults
      setLabel(initialItem?.label ?? 'New Wire')
      setColor(initialItem?.color ?? '#222222')
    }
  }, [open, initialItem])

  function handleCancel() {
    onClose(null)
  }

  function handleAdd() {
    const newItem = {
      // preserve existing type when editing
      type: initialItem?.type ?? `${sectionKey || 'wires'}-wire-${Date.now()}`,
      label: label || 'New Wire',
      color: color || '#222222',
    }
    onClose(newItem)
  }

  return (
    <Dialog open={!!open} onClose={handleCancel} fullWidth maxWidth="xs">
      <DialogTitle>{initialItem ? 'Edit Wire' : 'Create Wire'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            fullWidth
            size="small"
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <InputLabel sx={{ fontSize: 13, color: 'rgba(0,0,0,0.6)' }}>Color</InputLabel>
            <MuiColorInput value={color} onChange={(v) => setColor(v || '#222222')} format="hex" />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained">{initialItem ? 'Edit' : 'Add'}</Button>
      </DialogActions>
    </Dialog>
  )
}
