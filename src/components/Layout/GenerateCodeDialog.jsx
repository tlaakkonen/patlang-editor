import React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Divider from '@mui/material/Divider'
import { usePalette } from '../../state/PaletteContext'
import { analyzeOutputNodes, collectAllNodeInstances, nodesHaveMissingInputConnections } from '../../utils/validation'

export default function GenerateCodeDialog({ open, onClose }) {
  const { sections, findItemByType } = usePalette()
  const [validationErrors, setValidationErrors] = React.useState([])
  const [activeStep, setActiveStep] = React.useState(0)

  const steps = ['Validation', 'Step 2', 'Step 3', 'Step 4']

  React.useEffect(() => {
    if (!open) return

    const errs = []

    const diagrams = (sections || []).find((s) => s.key === 'diagrams')?.items || []
    const equations = (sections || []).find((s) => s.key === 'equations')?.items || []

  // use shared helper for output-node analysis

    // (Replaced by checking all node instances below)

    // For each equation, run the same validation as AddEquationDialog
    for (const eq of equations) {
      const lhsType = eq?.['lhs-type']
      const rhsType = eq?.['rhs-type']
      if (!lhsType || !rhsType) {
        errs.push(`Equation "${eq?.label || eq?.type}" missing LHS or RHS diagram`)
        continue
      }

      const lhs = diagrams.find((d) => d.type === lhsType)
      const rhs = diagrams.find((d) => d.type === rhsType)
      if (!lhs) {
        errs.push(`Equation "${eq?.label || eq?.type}": LHS diagram not found or has no saved state.`)
        continue
      }
      if (!rhs) {
        errs.push(`Equation "${eq?.label || eq?.type}": RHS diagram not found or has no saved state.`)
        continue
      }

      const lhsNodes = lhs.nodes || []
      const rhsNodes = rhs.nodes || []
      const lhsEdges = lhs.edges || []
      const rhsEdges = rhs.edges || []

      const lhsAnalysis = analyzeOutputNodes(lhsNodes, findItemByType)
      const rhsAnalysis = analyzeOutputNodes(rhsNodes, findItemByType)

      // Rule 1: at most one of each output node type in each diagram
      const lhsHasDuplicates = Object.values(lhsAnalysis.outputTypeCounts).some((c) => c > 1)
      const rhsHasDuplicates = Object.values(rhsAnalysis.outputTypeCounts).some((c) => c > 1)
      if (lhsHasDuplicates || rhsHasDuplicates) {
        errs.push(`Equation "${eq?.label || eq?.type}": diagrams contain more than one of the same output box`)
      }

      // Rule 2: set of output node types must be identical
      const lhsSet = lhsAnalysis.outputTypes
      const rhsSet = rhsAnalysis.outputTypes
      const onlyInLhs = [...lhsSet].filter((x) => !rhsSet.has(x))
      const onlyInRhs = [...rhsSet].filter((x) => !lhsSet.has(x))
      if (onlyInLhs.length || onlyInRhs.length) {
        errs.push(`Equation "${eq?.label || eq?.type}": diagrams don't contain the same outputs`)
      }

      // Rule 3: for each node instance (not only outputs), every input handle index must have an edge
      const lhsAllInstances = collectAllNodeInstances(lhsNodes, findItemByType)
      const rhsAllInstances = collectAllNodeInstances(rhsNodes, findItemByType)

      const lhsMissing = nodesHaveMissingInputConnections(lhsAllInstances, lhsEdges)
      const rhsMissing = nodesHaveMissingInputConnections(rhsAllInstances, rhsEdges)
      if (lhsMissing || rhsMissing) errs.push(`Equation "${eq?.label || eq?.type}": a node is missing a connection to its input`)
    }

    // (Combined into Rule 3 above) — no separate per-diagram check needed

    setValidationErrors(errs)
  }, [open, sections, findItemByType])

  const hasErrors = validationErrors.length > 0
  // Generic per-step advancement control. Update this to add custom checks
  // for other steps as the wizard grows.
  const canAdvance = (step) => {
    if (step === 0) return !hasErrors
    return true
  }

  const handleNext = () => {
    // double-check before advancing
    if (!canAdvance(activeStep)) return
    setActiveStep((s) => Math.min(s + 1, steps.length - 1))
  }

  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0))

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Box component="span" sx={{ fontWeight: 500 }}>Generate Code</Box>
        </Box>
        {/* Stepper moved to the dialog actions for bottom placement */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mt: 2 }}>
            {activeStep === 0 && (
              <Box>
                {hasErrors ? (
                  <Alert severity="error">
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2">Validation errors found — please fix these before generating code:</Typography>
                    </Box>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {validationErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </Alert>
                ) : (
                  <Alert severity="success">All equation and diagrams referenced by equations look valid.</Alert>
                )}
              </Box>
            )}

            {activeStep === 1 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2">Step 2 — placeholder</Typography>
              </Box>
            )}

            {activeStep === 2 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2">Step 3 — placeholder</Typography>
              </Box>
            )}

            {activeStep === 3 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2">Step 4 — placeholder</Typography>
              </Box>
            )}
          </Box>
        </Box>
  </DialogContent>
  <Divider sx={{ mt: 1 }} />
  <DialogActions sx={{ alignItems: 'center' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Box sx={{ flex: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, mr: 2 }}>
          <Stepper activeStep={activeStep} sx={{ minWidth: 220 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ flex: 1 }} />
        <Button onClick={handleBack} disabled={activeStep === 0}>Back</Button>
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={activeStep === steps.length - 1 || !canAdvance(activeStep)}
        >
          Next
        </Button>
      </DialogActions>
    </Dialog>
  )
}
