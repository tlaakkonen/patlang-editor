import React from 'react'
import Popover from '@mui/material/Popover'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Backdrop from '@mui/material/Backdrop'
import Divider from '@mui/material/Divider'

const TOUR_STORAGE_KEY = 'patlang:tour:v1'

function useLocalStorageFlag(key) {
  const [flag, setFlag] = React.useState(() => {
    try {
      return typeof window !== 'undefined' ? !!localStorage.getItem(key) : false
    } catch {
      return false
    }
  })

  const setTrue = React.useCallback(() => {
    setFlag(true)
    try {
      localStorage.setItem(key, '1')
    } catch {
      // ignore
    }
  }, [key])

  return [flag, setTrue]
}

function getAnchor(targetId) {
  if (typeof document === 'undefined') return null
  const el = targetId ? document.getElementById(targetId) : null
  return el || document.getElementById('top-menu') || document.body
}

export default function Tour() {
  // do not show tour again if completed or dismissed previously
  const [completed, markCompleted] = useLocalStorageFlag(TOUR_STORAGE_KEY)
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState(0)

  const steps = React.useMemo(() => [
    {
      id: 'welcome',
      targetId: 'top-menu',
      title: 'Welcome!',
      text:
        'This quick tour will show you the main areas: the top menu, the palette, and the canvas.',
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
      transformOrigin: { vertical: 'top', horizontal: 'center' },
    },
    {
      id: 'palette-overview',
      targetId: 'palette-diagrams',
      title: 'Palette',
      text: 
        'This is the palette, which contains items you can drag onto the canvas, as well as the diagrams and equations you can edit.',
      anchorOrigin: { vertical: 'center', horizontal: 'right' },
      transformOrigin: { vertical: 'center', horizontal: 'left' },
    },
    {
      id: 'palette-diagrams',
      targetId: 'palette-diagrams',
      title: 'Diagrams',
      text:
        'This section manages diagram canvases. Double-click a diagram to open it.',
      anchorOrigin: { vertical: 'center', horizontal: 'right' },
      transformOrigin: { vertical: 'center', horizontal: 'left' },
    },
    {
      id: 'palette-wires',
      targetId: 'palette-wires',
      title: 'Wires',
      text:
        'Here, you define wire types by a label and color, which will be used for box inputs and outputs.',
      anchorOrigin: { vertical: 'center', horizontal: 'right' },
      transformOrigin: { vertical: 'center', horizontal: 'left' },
    },
    {
      id: 'palette-boxes',
      targetId: 'palette-boxes',
      title: 'Boxes',
      text:
        'Add boxes with input and output wire types. Drag a box from here to the canvas to add it.',
      anchorOrigin: { vertical: 'center', horizontal: 'right' },
      transformOrigin: { vertical: 'center', horizontal: 'left' },
    },
    {
      id: 'palette-equations',
      targetId: 'palette-equations',
      title: 'Equations',
      text:
        'Here you can configure equations that tie diagrams together for the final loss function.',
      anchorOrigin: { vertical: 'center', horizontal: 'right' },
      transformOrigin: { vertical: 'center', horizontal: 'left' },
    },
    {
      id: 'canvas',
      targetId: 'app-canvas',
      title: 'Canvas',
      text:
        'Build your diagram here. Add boxes from the palette and connect matching wire types with edges.',
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
      transformOrigin: { vertical: 'bottom', horizontal: 'center' },
    },
    {
      id: 'generate',
      targetId: 'generate-button',
      title: 'Generate code',
      text:
        'When ready, open Generate Code to configure and export PyTorch code. Or use Train in Browser to train your model live on MNIST!',
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      transformOrigin: { vertical: 'top', horizontal: 'right' },
    },
    {
      id: 'save-load',
      targetId: 'save-button',
      title: 'Save and Load',
      text:
        'You can find example diagrams in the Load dialog. Use Save to export your work as JSON, and Load to import it back later. Clear wipes local data from this browser.',
      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
      transformOrigin: { vertical: 'top', horizontal: 'left' },
    },
  ], [])

  // initialize showing once on first mount if not completed yet
  React.useEffect(() => {
    if (!completed) setOpen(true)
  }, [completed])

  const current = steps[step]
  const atFirst = step === 0
  const atLast = step === steps.length - 1
  const anchorEl = current ? getAnchor(current.targetId) : getAnchor('top-menu')

  function handleNext() {
    if (atLast) {
      handleFinish()
    } else {
      setStep((s) => Math.min(s + 1, steps.length - 1))
    }
  }
  function handleBack() {
    setStep((s) => Math.max(0, s - 1))
  }
  function handleSkip() {
    // persist that the user dismissed the tour
    markCompleted()
    setOpen(false)
  }
  function handleFinish() {
    markCompleted()
    setOpen(false)
  }

  if (completed || !open) return null

  return (
    <>
      <Backdrop open={open} sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: 'rgba(0,0,0,0.35)' }} />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleSkip}
        anchorOrigin={current?.anchorOrigin || { vertical: 'center', horizontal: 'center' }}
        transformOrigin={current?.transformOrigin || { vertical: 'center', horizontal: 'center' }}
        slotProps={{ paper: { sx: { p: 3, maxWidth: 420, bgcolor: 'background.paper' } } }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            Step {step + 1} of {steps.length}
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.75 }}>
            {current?.title}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5 }}>
            {current?.text}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Button size="small" color="inherit" onClick={handleSkip}
              sx={{ textTransform: 'none' }}>
              Skip
            </Button>
            <Stack direction="row" spacing={1.25}>
              <Button size="small" variant="outlined" onClick={handleBack} disabled={atFirst}>
                Back
              </Button>
              <Button size="small" variant="contained" onClick={handleNext}>
                {atLast ? 'Finish' : 'Next'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </>
  )
}
