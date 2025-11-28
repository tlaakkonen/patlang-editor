import React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

// Dialog for creating/editing a saved diagram palette item.
// The dialog currently only collects the diagram name (label).
export default function AddDiagramDialog({ open, onClose, sectionKey, initialItem = null }) {
  const [label, setLabel] = React.useState('New Diagram')

  React.useEffect(() => {
    if (open) {
      setLabel(initialItem?.label ?? 'New Diagram')
    }
  }, [open, initialItem])

  function handleCancel() {
    onClose(null)
  }

  function handleAdd() {
    const newItem = {
      type: initialItem?.type ?? `${sectionKey || 'diagrams'}-diagram-${Date.now()}`,
      label: label || 'New Diagram',
      nodes: [],
      edges: []
    }
    onClose(newItem)
  }

  return (
    <Dialog open={!!open} onClose={handleCancel} fullWidth maxWidth="xs">
      <DialogTitle>{initialItem ? 'Edit Diagram' : 'Create Diagram'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            fullWidth
            size="small"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained">{initialItem ? 'Edit' : 'Add'}</Button>
      </DialogActions>
    </Dialog>
  )
}
