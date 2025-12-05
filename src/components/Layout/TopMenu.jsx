import React from 'react'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import SaveIcon from '@mui/icons-material/Save'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DeleteIcon from '@mui/icons-material/Delete'
import CodeIcon from '@mui/icons-material/Code'
import BoltIcon from '@mui/icons-material/Bolt'
import SaveDialog from './SaveDialog'
import LoadDialog from './LoadDialog'
import ClearDialog from './ClearDialog'
import GenerateCodeDialog from './GenerateCodeDialog'
import TrainLiveDialog from './TrainLiveDialog'
import { usePalette } from '../../state/PaletteContext'
import { useThemeContext } from '../../state/ThemeContext'

export default function TopMenu() {
  const { sections, setSections, nodes, setNodes, edges, setEdges } = usePalette()
  const [saveOpen, setSaveOpen] = React.useState(false)
  const [clearOpen, setClearOpen] = React.useState(false)
  const [loadOpen, setLoadOpen] = React.useState(false)
  const [generateOpen, setGenerateOpen] = React.useState(false)
  const [trainOpen, setTrainOpen] = React.useState(false)
  const { darkMode, setDarkMode } = useThemeContext()

  function handleSave() {
    setSaveOpen(true)
  }

  function closeSaveDialog() {
    setSaveOpen(false)
  }


  function handleLoad() {
    setLoadOpen(true)
  }

  function handleGenerate() {
    setGenerateOpen(true)
  }

  function handleTrain() {
    setTrainOpen(true)
  }

  function closeGenerateDialog() {
    setGenerateOpen(false)
  }

  function closeTrainDialog() {
    setTrainOpen(false)
  }

  function openClearDialog() {
    setClearOpen(true)
  }

  function closeClearDialog() {
    setClearOpen(false)
  }

  // Clear action moved into ClearDialog component; TopMenu only toggles open state.

  function closeLoadDialog() {
    setLoadOpen(false)
  }

  return (
    <>
      <Paper
        id="top-menu"
        elevation={0}
        square
        sx={{
          px: 3,
          py: 1.5,
          bgcolor: (theme) => theme.palette.background.paper,
        }}
      >
        <Box sx={{ width: '100%', mx: 'auto' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            {/* Left: App logo from public/logo.svg, tinted via currentColor using CSS mask */}
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Box
                aria-label="App logo"
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: 'text.primary',
                  // Use mask so the logo follows current text color (light in dark mode, dark in light mode)
                  mask: 'url("./logo.svg") no-repeat center',
                  WebkitMask: 'url("./logo.svg") no-repeat center',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                }}
              />
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                id="darkmode-button"
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => setDarkMode(!darkMode)}
                aria-pressed={darkMode}
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
              >
                <Switch
                  size="small"
                  color="primary"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                Dark Mode
              </Button>

              <Button id="save-button" size="small" variant="outlined" startIcon={<SaveIcon />} onClick={handleSave}>
                Save
              </Button>
              <Button id="load-button" size="small" variant="outlined" startIcon={<UploadFileIcon />} onClick={handleLoad}>
                Load
              </Button>
              <Button
                id="clear-button"
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={openClearDialog}
              >
                Clear
              </Button>
              <Button id="generate-button" size="small" variant="contained" startIcon={<CodeIcon />} onClick={handleGenerate}>
                Generate Code
              </Button>
              <Button
                id="train-button"
                size="small"
                variant="contained"
                color="warning"
                startIcon={<BoltIcon />}
                onClick={handleTrain}
              >
                Train in Browser
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      <SaveDialog
        open={saveOpen}
        onClose={closeSaveDialog}
        sections={sections}
        nodes={nodes}
        edges={edges}
      />

      <GenerateCodeDialog open={generateOpen} onClose={closeGenerateDialog} />

  <TrainLiveDialog open={trainOpen} onClose={closeTrainDialog} />

      <LoadDialog
        open={loadOpen}
        onClose={closeLoadDialog}
        onImport={(parsed) => {
          if (parsed.sections) setSections(parsed.sections)
          if (parsed.nodes) setNodes(parsed.nodes)
          if (parsed.edges) setEdges(parsed.edges)
        }}
      />

      <ClearDialog open={clearOpen} onClose={closeClearDialog} />
    </>
  )
}
