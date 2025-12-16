import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material'
import {
  Calculate,
  AccountBalance,
  Savings,
  Settings,
  CalendarToday,
  PaymentOutlined,
  Share,
  TouchApp,
} from '@mui/icons-material'
import {
  mortgageFormSchema,
  defaultFormValues
} from '../utils/validation'
import { generateShareableLink, copyToClipboard } from '../utils/urlParser'
import type { MortgageFormData } from '../utils/validation'

const STORAGE_KEY = 'mortgasim-form-values'

interface MortgageFormProps {
  onSubmit: (data: MortgageFormData) => void
  initialValues?: Partial<MortgageFormData>
}

// Load saved values from localStorage
const loadSavedValues = (): Partial<MortgageFormData> | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

// Save values to localStorage
const saveValues = (values: MortgageFormData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
  } catch (error) {
    console.warn('Failed to save form values:', error)
  }
}

export const MortgageForm: React.FC<MortgageFormProps> = ({
  onSubmit,
  initialValues,
}) => {
  // Priority: URL params > localStorage > defaults
  const savedValues = loadSavedValues()
  const formValues = initialValues || savedValues || defaultFormValues

  const [shareSnackbar, setShareSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSubmittedRef = useRef<string>('')
  const isInitialMount = useRef(true)

  const {
    control,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<MortgageFormData>({
    resolver: zodResolver(mortgageFormSchema) as any,
    defaultValues: formValues,
    mode: 'onChange',
  })

  // Reset form when initialValues change (e.g., from URL parameters)
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      reset(initialValues)
    }
  }, [initialValues, reset])

  // Watch all form values
  const currentValues = watch()

  // Debounced auto-submit on form changes
  const debouncedSubmit = useCallback((data: MortgageFormData) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      const valueString = JSON.stringify(data)
      // Only submit if values actually changed
      if (valueString !== lastSubmittedRef.current) {
        lastSubmittedRef.current = valueString
        saveValues(data)
        onSubmit(data)
      }
    }, 500)
  }, [onSubmit])

  // Auto-submit when form values change
  useEffect(() => {
    // Skip initial mount - let MortgageSimulation handle initial load
    if (isInitialMount.current) {
      isInitialMount.current = false
      // Save initial values to localStorage
      saveValues(currentValues as MortgageFormData)
      return
    }

    if (isValid) {
      debouncedSubmit(currentValues as MortgageFormData)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [currentValues, isValid, debouncedSubmit])

  const handleShareLink = async () => {
    try {
      const shareableLink = generateShareableLink(currentValues)
      const success = await copyToClipboard(shareableLink)
      
      if (success) {
        setShareSnackbar({
          open: true,
          message: 'Share link copied to clipboard!',
          severity: 'success'
        })
      } else {
        setShareSnackbar({
          open: true,
          message: 'Failed to copy to clipboard. Please try again.',
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('Failed to generate share link:', error)
      setShareSnackbar({
        open: true,
        message: 'Failed to generate share link.',
        severity: 'error'
      })
    }
  }

  const handleCloseSnackbar = () => {
    setShareSnackbar(prev => ({ ...prev, open: false }))
  }

  return (
    <Card elevation={3}>
      <CardContent sx={{ p: 3 }}>
        {/* Header with share button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calculate color="primary" />
            Mortgage Simulation Parameters
          </Typography>

          <Button
            onClick={handleShareLink}
            variant="outlined"
            size="small"
            startIcon={<Share />}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.50',
                borderColor: 'primary.dark',
              }
            }}
          >
            Share Link
          </Button>
        </Box>

        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Top Row: Start Date + Mortgage Details + Savings Details */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr 1.5fr' }, gap: 2 }}>
            {/* Start Date & Birth Year */}
            <Paper elevation={1} sx={{ p: 2, backgroundColor: 'rgba(76, 175, 80, 0.02)' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, fontWeight: 600 }}>
                <CalendarToday color="success" fontSize="small" />
                Dates
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Controller
                  name="start_date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Start Date"
                      type="date"
                      error={!!errors.start_date}
                      helperText={errors.start_date?.message}
                      fullWidth
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}
                />
                <Controller
                  name="birth_year"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      value={field.value ?? ''}
                      label="Birth Year"
                      type="number"
                      error={!!errors.birth_year}
                      helperText={errors.birth_year?.message || 'For age on charts'}
                      fullWidth
                      placeholder="1985"
                      inputProps={{ min: 1900, max: 2020 }}
                      size="small"
                    />
                  )}
                />
              </Box>
            </Paper>

            {/* Mortgage Parameters */}
            <Paper elevation={1} sx={{ p: 2, backgroundColor: 'rgba(25, 118, 210, 0.02)' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, fontWeight: 600 }}>
                <AccountBalance color="primary" fontSize="small" />
                Mortgage Details
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                <Controller
                  name="mortgage_amount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      label="Amount (£)"
                      type="number"
                      error={!!errors.mortgage_amount}
                      helperText={errors.mortgage_amount?.message}
                      fullWidth
                      placeholder="200000"
                      size="small"
                    />
                  )}
                />

                <Controller
                  name="term_years"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      label="Term (Years)"
                      type="number"
                      error={!!errors.term_years}
                      helperText={errors.term_years?.message}
                      fullWidth
                      placeholder="25"
                      inputProps={{ min: 1, max: 40 }}
                      size="small"
                    />
                  )}
                />

                <Controller
                  name="fixed_rate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      label="Fixed Rate (%)"
                      type="number"
                      error={!!errors.fixed_rate}
                      helperText={errors.fixed_rate?.message}
                      fullWidth
                      placeholder="1.65"
                      inputProps={{ min: 0, max: 15, step: 0.01 }}
                      size="small"
                    />
                  )}
                />

                <Controller
                  name="fixed_term_months"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      label="Fixed Term (Mo)"
                      type="number"
                      error={!!errors.fixed_term_months}
                      helperText={errors.fixed_term_months?.message}
                      fullWidth
                      placeholder="24"
                      inputProps={{ min: 0 }}
                      size="small"
                    />
                  )}
                />

                <Controller
                  name="variable_rate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      label="Variable Rate (%)"
                      type="number"
                      error={!!errors.variable_rate}
                      helperText={errors.variable_rate?.message}
                      fullWidth
                      placeholder="6.0"
                      inputProps={{ min: 0, max: 15, step: 0.01 }}
                      size="small"
                    />
                  )}
                />

                <Controller
                  name="max_payment_after_fixed"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      label="Max Payment (£)"
                      type="number"
                      error={!!errors.max_payment_after_fixed}
                      helperText={errors.max_payment_after_fixed?.message || 'Optional'}
                      fullWidth
                      placeholder="Optional"
                      size="small"
                    />
                  )}
                />
              </Box>
            </Paper>

            {/* Savings Parameters */}
            <Paper elevation={1} sx={{ p: 2, backgroundColor: 'rgba(46, 125, 50, 0.02)' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, fontWeight: 600 }}>
                <Savings color="success" fontSize="small" />
                Savings Details
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                <Controller
                  name="initial_balance"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      label="Initial (£)"
                      type="number"
                      error={!!errors.initial_balance}
                      helperText={errors.initial_balance?.message}
                      fullWidth
                      placeholder="170000"
                      inputProps={{ min: 0 }}
                      size="small"
                    />
                  )}
                />

                <Controller
                  name="monthly_contribution"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      label="Monthly (£)"
                      type="number"
                      error={!!errors.monthly_contribution}
                      helperText={errors.monthly_contribution?.message}
                      fullWidth
                      placeholder="2500"
                      inputProps={{ min: 0 }}
                      size="small"
                    />
                  )}
                />

                <Controller
                  name="savings_rate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      label="Rate (%)"
                      type="number"
                      error={!!errors.savings_rate}
                      helperText={errors.savings_rate?.message}
                      fullWidth
                      placeholder="4.3"
                      inputProps={{ min: 0, max: 15, step: 0.01 }}
                      size="small"
                    />
                  )}
                />
              </Box>
            </Paper>
          </Box>

          {/* Bottom Row: Simulation Settings + Overpayments Note */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
            {/* Simulation Parameters */}
            <Paper elevation={1} sx={{ p: 2, backgroundColor: 'rgba(156, 39, 176, 0.02)' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, fontWeight: 600 }}>
                <Settings color="secondary" fontSize="small" />
                Simulation Settings
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                <Controller
                  name="typical_payment"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      label="Monthly Payment (£)"
                      type="number"
                      error={!!errors.typical_payment}
                      helperText={errors.typical_payment?.message}
                      fullWidth
                      placeholder="878"
                      inputProps={{ min: 0 }}
                      size="small"
                    />
                  )}
                />

                <Controller
                  name="asset_value"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      label="Property Value (£)"
                      type="number"
                      error={!!errors.asset_value}
                      helperText={errors.asset_value?.message}
                      fullWidth
                      placeholder="360000"
                      inputProps={{ min: 0 }}
                      size="small"
                    />
                  )}
                />

                <Controller
                  name="show_years_after_payoff"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      label="Years After Payoff"
                      type="number"
                      error={!!errors.show_years_after_payoff}
                      helperText={errors.show_years_after_payoff?.message}
                      fullWidth
                      placeholder="5"
                      inputProps={{ min: 0, max: 20 }}
                      size="small"
                    />
                  )}
                />
              </Box>
            </Paper>

            {/* Overpayments Note */}
            <Paper elevation={1} sx={{ p: 2, backgroundColor: 'rgba(237, 108, 2, 0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, fontWeight: 600 }}>
                <PaymentOutlined color="warning" fontSize="small" />
                Overpayments
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  backgroundColor: 'rgba(255, 152, 0, 0.08)',
                  borderRadius: 1,
                  border: '1px dashed rgba(255, 152, 0, 0.4)',
                }}
              >
                <TouchApp sx={{ fontSize: 24, color: 'warning.main' }} />
                <Box>
                  <Typography variant="body2" fontWeight="medium" color="text.primary">
                    Click on the Balance Chart
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Add overpayments by clicking on the chart below. Drag to adjust timing.
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </CardContent>

      {/* Share Feedback Snackbar */}
      <Snackbar
        open={shareSnackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={shareSnackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {shareSnackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  )
}