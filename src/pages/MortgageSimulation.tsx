import React, { useState, useEffect, useCallback, useRef } from 'react'
import { track } from '@vercel/analytics'
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material'
import {
  Error,
  FileDownload,
  TrendingUp,
} from '@mui/icons-material'
import { MortgageForm } from '../components/MortgageForm'
import { MortgageCharts } from '../components/MortgageCharts'
import { Footer } from '../components/Footer'
import { MortgageApiService, transformFormDataToRequest } from '../services/mortgageApi'
import { useDebouncedSimulation } from '../hooks/useDebouncedSimulation'
import { useOverpaymentStore } from '../store/overpaymentStore'
import { defaultFormValues } from '../utils/validation'
import type { MortgageFormData } from '../utils/validation'
import type { SimulationResponse, SimulationRequest } from '../types/mortgage'

const STORAGE_KEY = 'mortgasim-form-values'

// Load saved form values from localStorage
const loadSavedFormValues = (): MortgageFormData | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

// Utility function to safely extract error messages
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Unknown error'
}

export const MortgageSimulation: React.FC = () => {
  const [simulationResults, setSimulationResults] = useState<SimulationResponse | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [currentStartDate, setCurrentStartDate] = useState<string>('')
  const [currentBirthYear, setCurrentBirthYear] = useState<number | undefined>(undefined)
  const [currentAssetValue, setCurrentAssetValue] = useState<number>(360000)
  const [lastSimulationRequest, setLastSimulationRequest] = useState<SimulationRequest | null>(null)

  // Ref to track if we've done initial load
  const initialLoadRef = useRef(false)
  // Ref to track previous overpayments string to avoid unnecessary recalculations
  const prevOverpaymentsRef = useRef<string | null>(null)

  // Overpayment store
  const { chartOverpayments, toApiString } = useOverpaymentStore()

  // Debounced simulation for real-time overpayment updates
  const {
    debouncedMutate,
    mutate: immediateSimulate,
    isPending: isSimulating,
    isDebouncing,
    error: simulationError,
  } = useDebouncedSimulation({
    debounceMs: 500,
    onSuccess: (data) => {
      setSimulationResults(data)
      setWarnings(data.warnings || [])

      // Track successful simulation
      track('mortgage_simulation_completed', {
        page_type: 'home',
        has_warnings: (data.warnings || []).length > 0,
        warnings_count: (data.warnings || []).length,
        from_chart_overpayment: chartOverpayments.length > 0,
      })
    },
    onError: (error) => {
      console.error('Simulation failed:', error)

      // Track simulation errors
      track('mortgage_simulation_error', {
        page_type: 'home',
        error_message: getErrorMessage(error),
      })
    },
  })

  // Track home page visits
  useEffect(() => {
    track('home_page_visit', {
      page_url: window.location.pathname,
    })
  }, [])


  // Auto-load saved data on component mount
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true

      // Load from localStorage or use defaults
      const savedValues = loadSavedFormValues()
      const formValues = savedValues || defaultFormValues

      setCurrentStartDate(formValues.start_date)
      setCurrentBirthYear(formValues.birth_year)
      setCurrentAssetValue(formValues.asset_value)
      const request = transformFormDataToRequest(formValues)

      // Include any persisted overpayments from the store
      const overpaymentString = toApiString()
      if (overpaymentString && request.simulation) {
        request.simulation.overpayments = overpaymentString
        prevOverpaymentsRef.current = overpaymentString
      }

      setLastSimulationRequest(request)
      immediateSimulate(request)
    }
  }, [immediateSimulate, toApiString])

  // Real-time recalculation when overpayments change
  useEffect(() => {
    // Skip if no initial results yet or no base request to modify
    if (!simulationResults || !lastSimulationRequest) return

    // Build request with chart overpayments
    const overpaymentString = toApiString()

    // Only recalculate if overpayments actually changed
    if (overpaymentString === prevOverpaymentsRef.current) return
    prevOverpaymentsRef.current = overpaymentString

    // Clone the last request and update overpayments
    const request: SimulationRequest = JSON.parse(JSON.stringify(lastSimulationRequest))

    // Inject the overpayment string directly
    if (request.simulation) {
      request.simulation.overpayments = overpaymentString || null
    }

    console.log('Recalculating with overpayments:', overpaymentString)
    debouncedMutate(request)
  }, [chartOverpayments, simulationResults, lastSimulationRequest, toApiString, debouncedMutate])

  const handleFormSubmit = useCallback(
    (formData: MortgageFormData) => {
      setCurrentStartDate(formData.start_date)
      setCurrentBirthYear(formData.birth_year)
      setCurrentAssetValue(formData.asset_value)

      const request = transformFormDataToRequest(formData)

      // Preserve existing overpayments when form values change
      const overpaymentString = toApiString()
      if (overpaymentString && request.simulation) {
        request.simulation.overpayments = overpaymentString
      }

      setLastSimulationRequest(request)

      // Track form change
      track('mortgage_form_changed', {
        page_type: 'home',
        loan_amount: formData.mortgage_amount.toString(),
        term_years: formData.term_years.toString(),
        fixed_rate: formData.fixed_rate.toString(),
      })

      immediateSimulate(request)
    },
    [immediateSimulate, toApiString]
  )

  const handleExportCsv = async () => {
    if (!simulationResults || !lastSimulationRequest) return

    try {
      // Track CSV export attempt
      track('csv_export_started', {
        page_type: 'home',
      })

      const csvBlob = await MortgageApiService.exportCsv(lastSimulationRequest)

      // Create download link
      const url = window.URL.createObjectURL(csvBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `mortgage-simulation-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Track successful CSV export
      track('csv_export_completed', {
        page_type: 'home',
        file_size: csvBlob.size.toString(),
      })
    } catch (error) {
      console.error('Failed to export CSV:', error)

      // Track CSV export error
      track('csv_export_error', {
        page_type: 'home',
        error_message: getErrorMessage(error),
      })
    }
  }

  // Show recalculating indicator when debouncing or simulating from chart interaction
  const isRecalculating = isDebouncing || (isSimulating && chartOverpayments.length > 0)

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Minimal Header */}
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 1,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Typography variant="subtitle1" fontWeight={500} color="text.secondary">
          Mortgage & Savings Simulator
        </Typography>
      </Box>

      <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Error Display */}
        {simulationError && (
          <Alert severity="error" icon={<Error />} sx={{ mb: 3 }} elevation={1}>
            <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
              Simulation Error
            </Typography>
            <Typography variant="body2">{getErrorMessage(simulationError)}</Typography>
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {/* Form Section - Full Width on Top */}
          <Box sx={{ width: '100%' }}>
            <MortgageForm onSubmit={handleFormSubmit} />
          </Box>

          {/* Results Section - Full Width */}
          <Box sx={{ width: '100%' }}>
            {isSimulating && !simulationResults && (
              <Card elevation={3}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 400,
                      textAlign: 'center',
                      py: 8,
                    }}
                  >
                    <CircularProgress size={60} sx={{ mb: 3 }} />
                    <Typography variant="h5" gutterBottom>
                      Running simulation...
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      This may take a few seconds depending on the complexity of your scenario.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {simulationResults && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Export Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    onClick={handleExportCsv}
                    startIcon={<FileDownload />}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.50',
                        borderColor: 'primary.dark',
                      },
                    }}
                  >
                    Export CSV
                  </Button>
                </Box>

                {/* Charts */}
                <MortgageCharts
                  chartData={simulationResults.chart_data}
                  summaryStats={simulationResults.summary_statistics}
                  startDate={currentStartDate}
                  birthYear={currentBirthYear}
                  assetValue={currentAssetValue}
                  notes={warnings.length > 0 ? warnings : undefined}
                  isLoading={false}
                  isRecalculating={isRecalculating}
                />
              </Box>
            )}

            {!simulationResults && !isSimulating && (
              <Card elevation={3}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 400,
                      textAlign: 'center',
                      py: 8,
                    }}
                  >
                    <TrendingUp sx={{ fontSize: '4rem', mb: 2, color: 'primary.main' }} />
                    <Typography variant="h4" gutterBottom fontWeight={600}>
                      Loading simulation...
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 4, maxWidth: 500 }}
                    >
                      Your simulation will appear here. Adjust any parameter above to see results
                      update in real-time.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </Container>

      <Footer />
    </Box>
  )
}
