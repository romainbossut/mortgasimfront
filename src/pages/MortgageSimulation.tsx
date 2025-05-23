import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { track } from '@vercel/analytics'
import {
  Box,
  Container,
  Typography,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Paper,
  Snackbar,
} from '@mui/material'
import {
  CheckCircle,
  Error,
  FileDownload,
  CloudOff,
  TrendingUp,
  Share,
} from '@mui/icons-material'
import { MortgageForm } from '../components/MortgageForm'
import { MortgageCharts } from '../components/MortgageCharts'
import { Footer } from '../components/Footer'
import { MortgageApiService, transformFormDataToRequest } from '../services/mortgageApi'
import { decodeFormDataFromUrl, generateShareableLink, copyToClipboard } from '../utils/urlParser'
import { defaultFormValues } from '../utils/validation'
import type { MortgageFormData } from '../utils/validation'
import type { SimulationResponse, SimulationRequest } from '../types/mortgage'

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
  const [searchParams] = useSearchParams()
  const [simulationResults, setSimulationResults] = useState<SimulationResponse | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [currentStartDate, setCurrentStartDate] = useState<string>('')
  const [lastSimulationRequest, setLastSimulationRequest] = useState<SimulationRequest | null>(null)
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false)
  const [shareSnackbar, setShareSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  // Parse URL parameters
  const urlParams = useMemo(() => {
    console.log('=== URL PARSING START (MortgageSimulation) ===')
    console.log('Current URL:', window.location.href)
    console.log('SearchParams object:', searchParams)
    console.log('SearchParams toString:', searchParams.toString())
    
    const comprehensiveParams = decodeFormDataFromUrl(searchParams)
    console.log('Comprehensive params:', comprehensiveParams)
    console.log('=== URL PARSING END ===')
    return comprehensiveParams
  }, [searchParams])

  // Check if we have actual URL parameters (not empty object)
  const hasUrlParams = urlParams && Object.keys(urlParams).length > 0

  // Generate pre-filled form data
  const preFilledFormData = useMemo(() => {
    console.log('URL params for form:', urlParams)
    console.log('Has URL params:', hasUrlParams)
    
    if (!hasUrlParams) {
      console.log('No URL params - using default form values')
      return undefined // Let form use its own defaults
    }

    // Filter out undefined values before merging
    const filteredUrlParams = Object.fromEntries(
      Object.entries(urlParams).filter(([, value]) => value !== undefined)
    )

    const merged = {
      ...defaultFormValues,
      ...filteredUrlParams,
    }
    console.log('Pre-filled form data with URL params:', merged)
    return merged
  }, [urlParams, hasUrlParams])

  // Track home page visits
  useEffect(() => {
    track('home_page_visit', {
      page_url: window.location.pathname,
      is_sample_load: true,
    })
  }, [])

  // Mutation for running simulation
  const simulationMutation = useMutation({
    mutationFn: MortgageApiService.simulate,
    onSuccess: (data) => {
      setSimulationResults(data)
      setWarnings(data.warnings || [])
      
      // Track successful simulation
      track('mortgage_simulation_completed', {
        page_type: 'home',
        has_warnings: (data.warnings || []).length > 0,
        warnings_count: (data.warnings || []).length,
        auto_loaded: hasAutoLoaded,
      })
    },
    onError: (error) => {
      console.error('Simulation failed:', error)
      
      // Track simulation errors
      track('mortgage_simulation_error', {
        page_type: 'home',
        error_message: getErrorMessage(error),
        auto_loaded: hasAutoLoaded,
      })
    },
  })

  // Query for getting sample data
  const sampleQuery = useQuery({
    queryKey: ['sample-request'],
    queryFn: MortgageApiService.getSampleRequest,
    enabled: false, // Only run when explicitly called
  })

  // Health check query
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: MortgageApiService.healthCheck,
    retry: 3,
    refetchInterval: 300000, // 5 minutes
  })

  // Auto-load sample data on component mount (only if no URL params)
  useEffect(() => {
    const loadSampleData = async () => {
      if (!hasAutoLoaded && !hasUrlParams) {
        try {
          const sampleData = await sampleQuery.refetch()
          if (sampleData.data) {
            // Set a default start date for sample data
            const today = new Date().toISOString().split('T')[0]
            setCurrentStartDate(today)
            setLastSimulationRequest(sampleData.data)
            simulationMutation.mutate(sampleData.data)
            setHasAutoLoaded(true)
          }
        } catch (error) {
          console.error('Failed to auto-load sample:', error)
        }
      }
    }

    loadSampleData()
  }, [hasAutoLoaded, hasUrlParams, sampleQuery, simulationMutation])

  // Auto-run simulation with URL parameters
  useEffect(() => {
    const runInitialSimulation = async () => {
      if (!hasAutoLoaded && hasUrlParams && preFilledFormData) {
        try {
          const today = new Date().toISOString().split('T')[0]
          setCurrentStartDate(today)
          
          const request = transformFormDataToRequest({
            ...preFilledFormData,
            start_date: today,
          })
          
          setLastSimulationRequest(request)
          simulationMutation.mutate(request)
          setHasAutoLoaded(true)
        } catch (error) {
          console.error('Failed to auto-load URL simulation:', error)
        }
      }
    }

    runInitialSimulation()
  }, [hasAutoLoaded, hasUrlParams, preFilledFormData, simulationMutation])

  const handleFormSubmit = (formData: MortgageFormData) => {
    setCurrentStartDate(formData.start_date) // Store the start date
    const request = transformFormDataToRequest(formData)
    setLastSimulationRequest(request) // Store the request for CSV export
    
    // Track manual form submission
    track('mortgage_form_submitted', {
      page_type: 'home',
      loan_amount: formData.mortgage_amount.toString(),
      term_years: formData.term_years.toString(),
      fixed_rate: formData.fixed_rate.toString(),
      is_manual_submission: true,
    })
    
    simulationMutation.mutate(request)
  }

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

  const handleShareLink = async () => {
    try {
      const shareableLink = generateShareableLink(preFilledFormData || defaultFormValues)
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

  const getApiStatusChip = () => {
    if (healthQuery.isLoading) {
      return (
        <Chip
          icon={<CircularProgress size={14} />}
          label="Checking API..."
          color="warning"
          variant="outlined"
          size="small"
          sx={{ fontSize: '0.75rem' }}
        />
      )
    }
    
    if (healthQuery.isError) {
      return (
        <Chip
          icon={<CloudOff sx={{ fontSize: 14 }} />}
          label="API Offline"
          color="error"
          variant="outlined"
          size="small"
          sx={{ fontSize: '0.75rem' }}
        />
      )
    }
    
    return (
      <Chip
        icon={<CheckCircle sx={{ fontSize: 14 }} />}
        label="API Online"
        color="success"
        variant="outlined"
        size="small"
        sx={{ fontSize: '0.75rem' }}
      />
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Subtle Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={500} color="text.primary">
                Mortgage Simulation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Simulate mortgage payments, savings growth, and net worth over time
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getApiStatusChip()}
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Error Display */}
        {simulationMutation.isError && (
          <Alert 
            severity="error" 
            icon={<Error />}
            sx={{ mb: 3 }}
            elevation={1}
          >
            <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
              Simulation Error
            </Typography>
            <Typography variant="body2">
              {getErrorMessage(simulationMutation.error)}
            </Typography>
          </Alert>
        )}

        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: 4 
          }}
        >
          {/* Form Section */}
          <Box sx={{ flex: { xs: '1', lg: '0 0 420px' } }}>
            <MortgageForm
              onSubmit={handleFormSubmit}
              isLoading={simulationMutation.isPending}
              initialValues={hasUrlParams ? preFilledFormData : undefined}
            />
          </Box>

          {/* Results Section */}
          <Box sx={{ flex: 1 }}>
            {simulationMutation.isPending && (
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

            {simulationResults && !simulationMutation.isPending && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Export and Share Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    onClick={handleShareLink}
                    startIcon={<Share />}
                    variant="outlined"
                    size="small"
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
                      }
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
                  notes={warnings.length > 0 ? warnings : undefined}
                  isLoading={false}
                />
              </Box>
            )}

            {!simulationResults && !simulationMutation.isPending && (
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
                      Loading sample simulation...
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
                      We're automatically loading a sample mortgage simulation to show you how the tool works. 
                      You can modify the parameters on the left to run your own simulation.
                    </Typography>
                    <Box sx={{ 
                      p: 3, 
                      backgroundColor: 'rgba(25, 118, 210, 0.05)', 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'rgba(25, 118, 210, 0.2)'
                    }}>
                      <Typography variant="body2" color="primary.main" fontWeight="medium">
                        💡 <strong>Tip:</strong> Adjust any parameter and click "Run Simulation" to see your personalized results
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </Container>

      <Footer />

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
    </Box>
  )
} 