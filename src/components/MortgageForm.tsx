import React, { useState } from 'react'
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
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
} from '@mui/material'
import {
  Calculate,
  AccountBalance,
  Savings,
  Settings,
  CalendarToday,
  Add,
  Delete,
  PaymentOutlined,
} from '@mui/icons-material'
import { mortgageFormSchema, defaultFormValues } from '../utils/validation'
import type { MortgageFormData } from '../utils/validation'

interface MortgageFormProps {
  onSubmit: (data: MortgageFormData) => void
  isLoading?: boolean
  initialValues?: Partial<MortgageFormData>
}

export const MortgageForm: React.FC<MortgageFormProps> = ({
  onSubmit,
  isLoading = false,
  initialValues,
}) => {
  const formValues = initialValues ? { ...defaultFormValues, ...initialValues } : defaultFormValues
  const [lastSimulatedValues, setLastSimulatedValues] = useState<MortgageFormData | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<MortgageFormData>({
    resolver: zodResolver(mortgageFormSchema) as any,
    defaultValues: formValues,
  })

  // Use field array for custom overpayments
  const { fields, append, remove } = useFieldArray({
    control,
    name: "custom_overpayments"
  })

  // Watch all form values to detect changes
  const currentValues = watch()

  // Check if current form values differ from last simulated values
  const hasFormChanged = lastSimulatedValues ? 
    JSON.stringify(currentValues) !== JSON.stringify(lastSimulatedValues) : 
    false

  const handleFormSubmit = (data: any) => {
    setLastSimulatedValues(data)
    onSubmit(data)
  }

  // Button should be enabled if no simulation has run yet OR form has changed since last simulation
  const isButtonEnabled = !isLoading && (!lastSimulatedValues || hasFormChanged)

  const addCustomOverpayment = () => {
    const currentYear = new Date().getFullYear()
    append({ month: 1, year: currentYear, amount: 0 })
  }

  const removeCustomOverpayment = (index: number) => {
    remove(index)
  }

  return (
    <Card elevation={3}>
      <CardContent sx={{ p: 3 }}>
        {/* Header without reset button */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calculate color="primary" />
            Mortgage Simulation Parameters
          </Typography>
        </Box>

        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Start Date */}
          <Paper elevation={1} sx={{ p: 2, backgroundColor: 'rgba(76, 175, 80, 0.02)' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CalendarToday color="success" />
              Simulation Start Date
            </Typography>
            
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Start Date"
                  type="date"
                  error={!!errors.start_date}
                  helperText={errors.start_date?.message || 'All projections will be calculated from this date'}
                  fullWidth
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              )}
            />
          </Paper>

          {/* Mortgage Parameters */}
          <Paper elevation={1} sx={{ p: 2, backgroundColor: 'rgba(25, 118, 210, 0.02)' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AccountBalance color="primary" />
              Mortgage Details
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Controller
                name="mortgage_amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                    label="Mortgage Amount (£)"
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
                    label="Fixed Term (Months)"
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
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Savings color="success" />
              Savings Details
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Controller
                name="initial_balance"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                    label="Initial Savings (£)"
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
                    label="Monthly Savings (£)"
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
                    label="Savings Rate (%)"
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

          {/* Simulation Parameters */}
          <Paper elevation={1} sx={{ p: 2, backgroundColor: 'rgba(156, 39, 176, 0.02)' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Settings color="secondary" />
              Simulation Settings
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
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

          {/* Overpayments */}
          <Paper elevation={1} sx={{ p: 2, backgroundColor: 'rgba(237, 108, 2, 0.02)' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PaymentOutlined color="warning" />
              Overpayments (Optional)
            </Typography>
            
            <Controller
              name="overpayment_type"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <RadioGroup
                    {...field}
                    row
                    sx={{ gap: 2 }}
                  >
                    <FormControlLabel value="none" control={<Radio />} label="No Overpayments" />
                    <FormControlLabel value="regular" control={<Radio />} label="Regular Overpayments" />
                    <FormControlLabel value="custom" control={<Radio />} label="Custom Overpayments" />
                  </RadioGroup>
                </FormControl>
              )}
            />

            {/* Regular Overpayments */}
            {currentValues.overpayment_type === 'regular' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Set up regular monthly overpayments
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Controller
                    name="regular_overpayment_amount"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                        label="Monthly Amount (£)"
                        type="number"
                        error={!!errors.regular_overpayment_amount}
                        helperText={errors.regular_overpayment_amount?.message}
                        fullWidth
                        placeholder="500"
                        inputProps={{ min: 0 }}
                        size="small"
                      />
                    )}
                  />
                  <Controller
                    name="regular_overpayment_months"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                        label="Duration (Months)"
                        type="number"
                        error={!!errors.regular_overpayment_months}
                        helperText={errors.regular_overpayment_months?.message}
                        fullWidth
                        placeholder="12"
                        inputProps={{ min: 1, max: 300 }}
                        size="small"
                      />
                    )}
                  />
                </Box>
              </Box>
            )}

            {/* Custom Overpayments */}
            {currentValues.overpayment_type === 'custom' && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2">
                    Add specific overpayments by month/year
                  </Typography>
                  <Button
                    onClick={addCustomOverpayment}
                    startIcon={<Add />}
                    variant="outlined"
                    size="small"
                  >
                    Add Overpayment
                  </Button>
                </Box>
                
                {fields.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No overpayments added yet. Click "Add Overpayment" to start.
                  </Typography>
                )}
                
                {fields.map((field, index) => (
                  <Box 
                    key={field.id} 
                    sx={{ 
                      p: 2,
                      mb: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      }
                    }}
                  >
                    {/* Header with overpayment number and delete button */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium" color="text.secondary">
                        Overpayment #{index + 1}
                      </Typography>
                      <IconButton
                        onClick={() => removeCustomOverpayment(index)}
                        color="error"
                        size="small"
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'rgba(211, 47, 47, 0.1)' 
                          }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>

                    {/* Fields in a responsive grid */}
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr', sm: '200px 1fr' }, 
                      gap: 2,
                      alignItems: 'flex-start'
                    }}>
                      {/* Month/Year Date Input */}
                      <Controller
                        name={`custom_overpayments.${index}.month`}
                        control={control}
                        render={({ field: monthField }) => {
                          const currentMonth = currentValues.custom_overpayments?.[index]?.month || 1
                          const currentYear = currentValues.custom_overpayments?.[index]?.year || new Date().getFullYear()
                          const monthValue = `${currentYear}-${String(currentMonth).padStart(2, '0')}`
                          
                          return (
                            <TextField
                              type="month"
                              label="Month/Year"
                              size="small"
                              fullWidth
                              value={monthValue}
                              onChange={(e) => {
                                const [year, month] = e.target.value.split('-')
                                if (year && month) {
                                  monthField.onChange(parseInt(month))
                                  setValue(`custom_overpayments.${index}.year` as any, parseInt(year))
                                }
                              }}
                              error={!!errors.custom_overpayments?.[index]?.month || !!errors.custom_overpayments?.[index]?.year}
                              InputLabelProps={{
                                shrink: true,
                              }}
                            />
                          )
                        }}
                      />
                      
                      {/* Amount Field */}
                      <Controller
                        name={`custom_overpayments.${index}.amount`}
                        control={control}
                        render={({ field: amountField }) => (
                          <TextField
                            {...amountField}
                            onChange={(e) => amountField.onChange(e.target.value ? Number(e.target.value) : '')}
                            label="Amount (£)"
                            type="number"
                            error={!!errors.custom_overpayments?.[index]?.amount}
                            helperText={errors.custom_overpayments?.[index]?.amount?.message}
                            inputProps={{ min: 0 }}
                            size="small"
                            placeholder="5000"
                            fullWidth
                          />
                        )}
                      />
                    </Box>
                    
                    {/* Hidden Year Field */}
                    <Controller
                      name={`custom_overpayments.${index}.year`}
                      control={control}
                      render={() => <div style={{ display: 'none' }} />}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>

          {/* Run Simulation Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
            <Button
              onClick={handleSubmit(handleFormSubmit)}
              variant="contained"
              size="large"
              disabled={!isButtonEnabled}
              startIcon={<Calculate />}
              sx={{ 
                minWidth: 200,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              {isLoading ? 'Running Simulation...' : 'Run Simulation'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}