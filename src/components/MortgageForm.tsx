import React from 'react'
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
} from '@mui/material'
import {
  Calculate,
  AccountBalance,
  Savings,
  Settings,
  Refresh,
  PlayArrow,
  CalendarToday,
} from '@mui/icons-material'
import { mortgageFormSchema, defaultFormValues } from '../utils/validation'
import type { MortgageFormData } from '../utils/validation'

interface MortgageFormProps {
  onSubmit: (data: MortgageFormData) => void
  isLoading?: boolean
  onLoadSample?: () => void
}

export const MortgageForm: React.FC<MortgageFormProps> = ({
  onSubmit,
  isLoading = false,
  onLoadSample,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MortgageFormData>({
    resolver: zodResolver(mortgageFormSchema),
    defaultValues: defaultFormValues,
  })

  const handleLoadSample = () => {
    if (onLoadSample) {
      onLoadSample()
    }
  }

  const handleReset = () => {
    reset(defaultFormValues)
  }

  return (
    <Card elevation={3}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calculate color="primary" />
            Mortgage Simulation Parameters
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {onLoadSample && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleLoadSample}
                disabled={isLoading}
                startIcon={<PlayArrow sx={{ fontSize: '1rem' }} />}
                sx={{
                  minWidth: 130,
                  height: 36,
                  px: 2,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  },
                  '& .MuiButton-startIcon': {
                    marginLeft: 0,
                    marginRight: '8px',
                  },
                }}
              >
                Load Sample
              </Button>
            )}
            <Button
              variant="outlined"
              size="small"
              onClick={handleReset}
              disabled={isLoading}
              startIcon={<Refresh sx={{ fontSize: '1rem' }} />}
              sx={{
                minWidth: 90,
                height: 36,
                px: 2,
                fontSize: '0.875rem',
                fontWeight: 500,
                borderColor: 'grey.400',
                color: 'grey.700',
                textTransform: 'none',
                whiteSpace: 'nowrap',
                '&:hover': {
                  borderColor: 'grey.600',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                '& .MuiButton-startIcon': {
                  marginLeft: 0,
                  marginRight: '8px',
                },
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
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
                    label="Max Payment After Fixed (£)"
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
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
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
                    label="Monthly Contribution (£)"
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
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              <Controller
                name="typical_payment"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                    label="Typical Payment (£)"
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
            <Controller
              name="overpayments"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Overpayments (Optional)"
                  error={!!errors.overpayments}
                  helperText={
                    errors.overpayments?.message || 
                    'Format: month:amount,month:amount (e.g., "18:20000,24:15000")'
                  }
                  fullWidth
                  placeholder="e.g., 18:20000,24:15000"
                  multiline
                  rows={2}
                  size="small"
                />
              )}
            />
          </Paper>

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
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