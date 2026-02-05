import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
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
  IconButton,
  Tooltip,
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
  Add,
  Delete,
} from '@mui/icons-material'
import {
  mortgageFormSchema,
  defaultFormValues
} from '../utils/validation'
import { generateShareableLink, copyToClipboard } from '../utils/urlParser'
import type { MortgageFormData } from '../utils/validation'
import { DealTimeline } from './DealTimeline'

// Numeric text field — standard text input constrained to digits and dots.
// Avoids number input quirks (spinner arrows, scroll-to-change, selection issues).
const NumericField: React.FC<
  Omit<React.ComponentProps<typeof TextField>, 'type' | 'value' | 'onChange'> & {
    value: number | undefined | ''
    onChange: (value: number | '') => void
  }
> = ({ value, onChange, ...rest }) => {
  const [local, setLocal] = React.useState(() =>
    value != null && value !== '' ? String(value) : ''
  )

  const prev = React.useRef(value)
  React.useEffect(() => {
    if (value !== prev.current) {
      prev.current = value
      setLocal(value != null && value !== '' ? String(value) : '')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9.]/g, '')
    // Allow at most one dot
    const dotIdx = raw.indexOf('.')
    if (dotIdx !== -1) {
      raw = raw.slice(0, dotIdx + 1) + raw.slice(dotIdx + 1).replace(/\./g, '')
    }
    setLocal(raw)

    if (raw === '' || raw === '.') {
      onChange('')
    } else {
      const num = Number(raw)
      if (!isNaN(num)) onChange(num)
    }
  }

  return (
    <TextField
      {...rest}
      type="text"
      inputMode="decimal"
      value={local}
      onChange={handleChange}
    />
  )
}

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
    setValue,
  } = useForm<MortgageFormData>({
    resolver: zodResolver(mortgageFormSchema) as any,
    defaultValues: formValues,
    mode: 'onChange',
  })

  // Dynamic savings accounts array
  const { fields: accountFields, append: appendAccount, remove: removeAccount } = useFieldArray({
    control,
    name: 'savings_accounts',
  })

  const handleAddAccount = () => {
    appendAccount({
      name: `Account ${accountFields.length + 1}`,
      rate: 4.0,
      monthly_contribution: 0,
      initial_balance: 0,
    })
  }

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
                    <NumericField
                      value={field.value ?? ''}
                      onChange={(v) => field.onChange(v)}
                      label="Birth Year"
                      error={!!errors.birth_year}
                      helperText={errors.birth_year?.message || 'For age on charts'}
                      fullWidth
                      placeholder="1985"
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

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5, mb: 2 }}>
                <Controller
                  name="mortgage_amount"
                  control={control}
                  render={({ field }) => (
                    <NumericField
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                      label="Amount (£)"
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
                    <NumericField
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                      label="Term (Years)"
                      error={!!errors.term_years}
                      helperText={errors.term_years?.message}
                      fullWidth
                      placeholder="25"
                      size="small"
                    />
                  )}
                />

                <Controller
                  name="variable_rate"
                  control={control}
                  render={({ field }) => (
                    <NumericField
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                      label="SVR / Variable Rate (%)"
                      error={!!errors.variable_rate}
                      helperText={errors.variable_rate?.message}
                      fullWidth
                      placeholder="6.0"
                      size="small"
                    />
                  )}
                />
              </Box>

              {/* Deal Timeline */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Rate Deals — drag to resize/move, click to select
              </Typography>
              <Controller
                name="deals"
                control={control}
                render={({ field }) => (
                  <DealTimeline
                    deals={field.value || []}
                    onChange={(newDeals) => {
                      field.onChange(newDeals)
                      // Sync legacy fields from first deal for backward compat
                      if (newDeals.length > 0) {
                        const first = newDeals[0]
                        setValue('fixed_rate', first.rate)
                        setValue('fixed_term_months', first.end_month)
                      } else {
                        setValue('fixed_rate', 0)
                        setValue('fixed_term_months', 0)
                      }
                    }}
                    termYears={currentValues.term_years || 25}
                    variableRate={currentValues.variable_rate || 6.0}
                  />
                )}
              />
            </Paper>

            {/* Savings Accounts */}
            <Paper elevation={1} sx={{ p: 2, backgroundColor: 'rgba(46, 125, 50, 0.02)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                  <Savings color="success" fontSize="small" />
                  Savings Accounts
                </Typography>
                <Tooltip title="Add Account">
                  <IconButton
                    size="small"
                    onClick={handleAddAccount}
                    color="success"
                    disabled={accountFields.length >= 10}
                  >
                    <Add fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {accountFields.length === 0 ? (
                <Box sx={{
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  borderRadius: 1,
                  border: '1px dashed rgba(0,0,0,0.2)'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    No savings accounts. Click + to add one.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {accountFields.map((field, index) => (
                    <Box
                      key={field.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1.5fr 1fr 1fr 0.8fr auto' },
                        gap: 1,
                        alignItems: 'start',
                        p: 1,
                        backgroundColor: 'rgba(255,255,255,0.5)',
                        borderRadius: 1,
                        border: '1px solid rgba(0,0,0,0.08)'
                      }}
                    >
                      <Controller
                        name={`savings_accounts.${index}.name`}
                        control={control}
                        render={({ field: inputField }) => (
                          <TextField
                            {...inputField}
                            label="Name"
                            error={!!errors.savings_accounts?.[index]?.name}
                            helperText={errors.savings_accounts?.[index]?.name?.message}
                            fullWidth
                            placeholder="ISA"
                            size="small"
                          />
                        )}
                      />

                      <Controller
                        name={`savings_accounts.${index}.initial_balance`}
                        control={control}
                        render={({ field: inputField }) => (
                          <NumericField
                            value={inputField.value}
                            onChange={(v) => inputField.onChange(v)}
                            label="Initial (£)"
                            error={!!errors.savings_accounts?.[index]?.initial_balance}
                            helperText={errors.savings_accounts?.[index]?.initial_balance?.message}
                            fullWidth
                            placeholder="50000"
                            size="small"
                          />
                        )}
                      />

                      <Controller
                        name={`savings_accounts.${index}.monthly_contribution`}
                        control={control}
                        render={({ field: inputField }) => (
                          <NumericField
                            value={inputField.value}
                            onChange={(v) => inputField.onChange(v)}
                            label="Monthly (£)"
                            error={!!errors.savings_accounts?.[index]?.monthly_contribution}
                            helperText={errors.savings_accounts?.[index]?.monthly_contribution?.message}
                            fullWidth
                            placeholder="500"
                            size="small"
                          />
                        )}
                      />

                      <Controller
                        name={`savings_accounts.${index}.rate`}
                        control={control}
                        render={({ field: inputField }) => (
                          <NumericField
                            value={inputField.value}
                            onChange={(v) => inputField.onChange(v)}
                            label="Rate (%)"
                            error={!!errors.savings_accounts?.[index]?.rate}
                            helperText={errors.savings_accounts?.[index]?.rate?.message}
                            fullWidth
                            placeholder="4.0"
                            size="small"
                          />
                        )}
                      />

                      <Tooltip title="Remove Account">
                        <IconButton
                          size="small"
                          onClick={() => removeAccount(index)}
                          color="error"
                          sx={{ mt: 0.5 }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              )}
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
                    <NumericField
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                      label="Monthly Payment (£)"
                      error={!!errors.typical_payment}
                      helperText={errors.typical_payment?.message}
                      fullWidth
                      placeholder="878"
                      size="small"
                    />
                  )}
                />

                <Controller
                  name="asset_value"
                  control={control}
                  render={({ field }) => (
                    <NumericField
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                      label="Property Value (£)"
                      error={!!errors.asset_value}
                      helperText={errors.asset_value?.message}
                      fullWidth
                      placeholder="360000"
                      size="small"
                    />
                  )}
                />

                <Controller
                  name="show_years_after_payoff"
                  control={control}
                  render={({ field }) => (
                    <NumericField
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                      label="Years After Payoff"
                      error={!!errors.show_years_after_payoff}
                      helperText={errors.show_years_after_payoff?.message}
                      fullWidth
                      placeholder="5"
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