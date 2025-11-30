import React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import { usePalette } from '../../state/PaletteContext'
import { analyzeOutputNodes, nodesHaveMissingInputConnections } from '../../utils/validation'

// Dialog for creating/editing an equation palette item.
// Each equation item will have: 'type', 'label', 'lhs-type', 'rhs-type'.
// For now this dialog only edits the label; lhs/rhs types are left null by default.
export default function AddEquationDialog({ open, onClose, sectionKey, initialItem = null }) {
  const { sections, findItemByType } = usePalette()
  const diagrams = React.useMemo(
    () => (sections || []).find((s) => s.key === 'diagrams')?.items || [],
    [sections]
  )

  const [label, setLabel] = React.useState('New Equation')
  const [lhsType, setLhsType] = React.useState(initialItem?.['lhs-type'] ?? '')
  const [rhsType, setRhsType] = React.useState(initialItem?.['rhs-type'] ?? '')

  React.useEffect(() => {
    if (open) {
      setLabel(initialItem?.label ?? 'New Equation')
      setLhsType(initialItem?.['lhs-type'] ?? '')
      setRhsType(initialItem?.['rhs-type'] ?? '')
    }
  }, [open, initialItem])

  function handleCancel() {
    onClose(null)
  }

  function handleAdd() {
    const newItem = {
      // keep the same id/typing pattern as other palette items
      type: initialItem?.type ?? `${sectionKey || 'equations'}-equation-${Date.now()}`,
      label: label || 'New Equation',
      // save empty string as null to keep shape consistent
      'lhs-type': lhsType || null,
      'rhs-type': rhsType || null,
    }
    onClose(newItem)
  }

  const basicSelected = !!(lhsType && rhsType)

  // validation for diagram pair
  const [validationErrors, setValidationErrors] = React.useState([])

  React.useEffect(() => {
    const errs = []
    if (!lhsType || !rhsType) {
      setValidationErrors(errs)
      return
    }

    const lhs = diagrams.find((d) => d.type === lhsType)
    const rhs = diagrams.find((d) => d.type === rhsType)

    if (!lhs) {
      errs.push('LHS diagram not found or has no saved state.')
      setValidationErrors(errs)
      return
    }
    if (!rhs) {
      errs.push('RHS diagram not found or has no saved state.')
      setValidationErrors(errs)
      return
    }

    const lhsNodes = lhs.nodes || []
    const rhsNodes = rhs.nodes || []
    const lhsEdges = lhs.edges || []
    const rhsEdges = rhs.edges || []

    // use shared helper to compute output node types and instances

  const lhsAnalysis = analyzeOutputNodes(lhsNodes, findItemByType)
  const rhsAnalysis = analyzeOutputNodes(rhsNodes, findItemByType)

    // Rule 1: at most one of each output node type in each diagram
    const lhsHasDuplicates = Object.values(lhsAnalysis.outputTypeCounts).some((c) => c > 1)
    const rhsHasDuplicates = Object.values(rhsAnalysis.outputTypeCounts).some((c) => c > 1)
    if (lhsHasDuplicates || rhsHasDuplicates) {
      errs.push('These diagrams contain more than one of the same output box')
    }

    // Rule 2: set of output node types must be identical
    const lhsSet = lhsAnalysis.outputTypes
    const rhsSet = rhsAnalysis.outputTypes
    const onlyInLhs = [...lhsSet].filter((x) => !rhsSet.has(x))
    const onlyInRhs = [...rhsSet].filter((x) => !lhsSet.has(x))
    if (onlyInLhs.length || onlyInRhs.length) {
      errs.push("These diagrams don't contain the same outputs")
    }

    // Rule 3: for each output node instance, for every input handle index, there must be an edge whose target is that handle
    const lhsMissing = nodesHaveMissingInputConnections(lhsAnalysis.outputNodeInstances, lhsEdges)
    const rhsMissing = nodesHaveMissingInputConnections(rhsAnalysis.outputNodeInstances, rhsEdges)
    if (lhsMissing || rhsMissing) {
      errs.push('An output node is missing a connection to its input')
    }

    setValidationErrors(errs)
  }, [lhsType, rhsType, diagrams, findItemByType])

  const isValid = basicSelected && validationErrors.length === 0

  return (
    <Dialog open={!!open} onClose={handleCancel} fullWidth maxWidth="xs">
      <DialogTitle>{initialItem ? 'Edit Equation' : 'Create Equation'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            fullWidth
            size="small"
          />
          {validationErrors.length > 0 ? (
            <Alert severity="error">
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </Alert>
          ) : (!basicSelected && (
            <Alert severity="warning">Both LHS and RHS diagrams must be selected before adding an equation.</Alert>
          ))}
          <TextField
            select
            label="LHS Diagram"
            value={lhsType}
            onChange={(e) => setLhsType(e.target.value)}
            fullWidth
            size="small"
            error={!lhsType}
            helperText={!lhsType ? 'Select a diagram for LHS' : ''}
          >
            <MenuItem value="">(none)</MenuItem>
            {diagrams.map((d) => (
              <MenuItem key={d.type} value={d.type}>{d.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="RHS Diagram"
            value={rhsType}
            onChange={(e) => setRhsType(e.target.value)}
            fullWidth
            size="small"
            error={!rhsType}
            helperText={!rhsType ? 'Select a diagram for RHS' : ''}
          >
            <MenuItem value="">(none)</MenuItem>
            {diagrams.map((d) => (
              <MenuItem key={d.type} value={d.type}>{d.label}</MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained" disabled={!isValid}>{initialItem ? 'Edit' : 'Add'}</Button>
      </DialogActions>
    </Dialog>
  )
}
