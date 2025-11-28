import React from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import SaveIcon from '@mui/icons-material/Save'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DeleteIcon from '@mui/icons-material/Delete'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import MenuIcon from '@mui/icons-material/Menu'
import { usePalette } from '../../state/PaletteContext'

export default function TopMenu() {
  const { sections, setSections, nodes, setNodes, edges, setEdges } = usePalette()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [saveOpen, setSaveOpen] = React.useState(false)
  const [jsonText, setJsonText] = React.useState('')
  const [clearOpen, setClearOpen] = React.useState(false)
  const [loadOpen, setLoadOpen] = React.useState(false)
  const [loadText, setLoadText] = React.useState('')
  const [loadError, setLoadError] = React.useState('')

  function openMenu(e) {
    setAnchorEl(e.currentTarget)
  }
  function closeMenu() {
    setAnchorEl(null)
  }

  function handleSave() {
    const payload = { sections: sections || [], nodes: nodes || [], edges: edges || [] }
    const text = JSON.stringify(payload, null, 2)
    setJsonText(text)
    // open the dialog so the user can copy or download
    setSaveOpen(true)
    closeMenu()
  }

  function closeSaveDialog() {
    setSaveOpen(false)
  }

  async function handleCopy() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonText)
      } else {
        // fallback
        const ta = document.createElement('textarea')
        ta.value = jsonText
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
    } catch (err) {
      // ignore copy errors for now
    }
  }

  function handleDownloadFromDialog() {
    const blob = new Blob([jsonText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'patlang-export.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleLoad() {
    // open the import dialog where user can paste JSON or choose a file
    setLoadText('')
    setLoadError('')
    setLoadOpen(true)
    closeMenu()
  }

  function openClearDialog() {
    setClearOpen(true)
    closeMenu()
  }

  function closeClearDialog() {
    setClearOpen(false)
  }

  function handleClearConfirmed() {
    try {
      localStorage.removeItem('patlang:v1')
    } catch (err) {}
    setClearOpen(false)
    // reload to ensure app re-initializes from defaults
    window.location.reload()
  }

  function closeLoadDialog() {
    setLoadOpen(false)
    setLoadText('')
    setLoadError('')
  }

  function handleChooseFile() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = async (ev) => {
      const f = ev.target.files && ev.target.files[0]
      if (!f) return
      try {
        const text = await f.text()
        setLoadText(text)
        setLoadError('')
      } catch (err) {
        setLoadError('Failed to read file')
      }
    }
    input.click()
  }

  function handleApplyLoad() {
    if (!loadText) {
      setLoadError('No JSON to load')
      return
    }
    try {
      const parsed = JSON.parse(loadText)
      if (parsed.sections) setSections(parsed.sections)
      if (parsed.nodes) setNodes(parsed.nodes)
      if (parsed.edges) setEdges(parsed.edges)
      setLoadError('')
      setLoadOpen(false)
    } catch (err) {
      setLoadError('Invalid JSON')
    }
  }

  return (
    <>
      <Tooltip title="Menu">
        <Button
          size="small"
          variant="outlined"
          startIcon={<MenuIcon />}
          onClick={openMenu}
          aria-controls={anchorEl ? 'app-menu' : undefined}
          aria-haspopup="true"
          sx={{ bgcolor: 'background.paper' }}
        >
          Menu
        </Button>
      </Tooltip>
      <Menu id="app-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={handleSave}>
          <ListItemIcon>
            <SaveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Save</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLoad}>
          <ListItemIcon>
            <UploadFileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Load</ListItemText>
        </MenuItem>
        <MenuItem onClick={openClearDialog}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Clear local data</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={saveOpen} onClose={closeSaveDialog} fullWidth maxWidth="md">
        <DialogTitle>
          Export JSON
          <IconButton
            aria-label="close"
            onClick={closeSaveDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            value={jsonText}
            multiline
            fullWidth
            minRows={10}
            variant="outlined"
            slotProps={{input: { readOnly: true }}}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCopy}>Copy to clipboard</Button>
          <Button onClick={handleDownloadFromDialog} variant="outlined">Download</Button>
          <Button onClick={closeSaveDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={loadOpen} onClose={closeLoadDialog} fullWidth maxWidth="md">
        <DialogTitle>
          Import JSON
          <IconButton
            aria-label="close"
            onClick={closeLoadDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Button onClick={handleChooseFile} sx={{ mb: 1 }}>Choose file...</Button>
          {loadError && <Typography color="error" sx={{ mb: 1 }}>{loadError}</Typography>}
          <TextField
            value={loadText}
            onChange={(e) => setLoadText(e.target.value)}
            multiline
            fullWidth
            minRows={10}
            variant="outlined"
            placeholder="Paste JSON here or choose a file"
            inputProps={{ spellCheck: 'false' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLoadDialog}>Cancel</Button>
          <Button onClick={() => { setLoadText(''); setLoadError('') }}>Clear</Button>
          <Button onClick={handleApplyLoad} variant="contained">Load</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={clearOpen} onClose={closeClearDialog}>
        <DialogTitle>Clear local data?</DialogTitle>
        <DialogContent>
          <Typography>This will remove all autosaved local data from your browser. The app will reload afterwards.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeClearDialog}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleClearConfirmed}>Clear</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
