import React, { useState, useEffect, useCallback } from 'react'
import {
  Popover,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Stack,
} from '@mui/material'
import { Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material'
import type { ChartOverpayment } from '../../store/overpaymentStore'

interface OverpaymentPopoverProps {
  anchorEl: HTMLElement | null
  overpayment: ChartOverpayment | null
  isNew: boolean // True if this is a new overpayment being added
  onAmountChange: (amount: number) => void
  onConfirm: () => void
  onDelete: () => void
  onClose: () => void
}

export const OverpaymentPopover: React.FC<OverpaymentPopoverProps> = ({
  anchorEl,
  overpayment,
  isNew,
  onAmountChange,
  onConfirm,
  onDelete,
  onClose,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Reset input when overpayment changes
  useEffect(() => {
    if (overpayment) {
      setInputValue(overpayment.amount > 0 ? overpayment.amount.toString() : '')
      setError(null)
    }
  }, [overpayment?.id, overpayment?.amount])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)

      // Validate and update
      const numValue = parseFloat(value)
      if (value === '' || isNaN(numValue)) {
        setError(null)
        onAmountChange(0)
      } else if (numValue < 0) {
        setError('Amount must be positive')
      } else if (numValue > 10000000) {
        setError('Amount too large')
      } else {
        setError(null)
        onAmountChange(numValue)
      }
    },
    [onAmountChange]
  )

  const handleConfirm = useCallback(() => {
    const numValue = parseFloat(inputValue)
    if (!inputValue || isNaN(numValue) || numValue <= 0) {
      setError('Please enter a valid amount')
      return
    }
    onConfirm()
  }, [inputValue, onConfirm])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleConfirm()
      } else if (e.key === 'Escape') {
        onClose()
      }
    },
    [handleConfirm, onClose]
  )

  const open = Boolean(anchorEl) && Boolean(overpayment)

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      slotProps={{
        paper: {
          sx: {
            p: 2,
            minWidth: 280,
            maxWidth: 320,
            borderRadius: 2,
          },
        },
      }}
    >
      {overpayment && (
        <Box>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="subtitle1" fontWeight={600}>
              {isNew ? 'Add Overpayment' : 'Edit Overpayment'}
            </Typography>
            <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          {/* Date display */}
          <Typography variant="body2" color="text.secondary" mb={2}>
            {overpayment.dateLabel}
          </Typography>

          {/* Amount input */}
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            error={Boolean(error)}
            helperText={error || 'Enter the overpayment amount'}
            autoFocus
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">£</InputAdornment>,
              },
              htmlInput: {
                min: 0,
                step: 100,
              },
            }}
            sx={{ mb: 2 }}
          />

          {/* Actions */}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {!isNew && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onDelete}
                size="small"
              >
                Delete
              </Button>
            )}
            <Button variant="text" onClick={onClose} size="small">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={Boolean(error) || !inputValue}
              size="small"
            >
              {isNew ? 'Add' : 'Update'}
            </Button>
          </Stack>
        </Box>
      )}
    </Popover>
  )
}
