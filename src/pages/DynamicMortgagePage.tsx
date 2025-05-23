import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
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
import { parseMortgageSlug, parseMortgageQuery, decodeFormDataFromUrl, generateShareableLink, copyToClipboard } from '../utils/urlParser'
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

export const DynamicMortgagePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
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

  // Parse URL parameters - first try comprehensive URL decoding, fallback to legacy parsing
  const urlParams = useMemo(() => {
    // Try comprehensive URL parameter decoding first
    const comprehensiveParams = decodeFormDataFromUrl(searchParams)
    console.log('Comprehensive params:', comprehensiveParams)
    if (Object.keys(comprehensiveParams).length > 0) {
      return comprehensiveParams
    }
    
    // Fallback to legacy parsing for backwards compatibility
    if (slug) {
      const legacyParams = parseMortgageSlug(slug)
      console.log('Legacy slug params:', legacyParams)
      if (legacyParams) {
        return {
          mortgage_amount: legacyParams.loan,
          term_years: legacyParams.term,
          fixed_rate: legacyParams.rate,
          variable_rate: legacyParams.rate,
        }
      }
    } else {
      const legacyParams = parseMortgageQuery(searchParams)
      console.log('Legacy query params:', legacyParams)
      if (Object.keys(legacyParams).length > 0) {
        return {
          mortgage_amount: legacyParams.loan,
          term_years: legacyParams.term,
          fixed_rate: legacyParams.rate,
          variable_rate: legacyParams.rate,
        }
      }
    }
    
    console.log('No URL params found, returning empty object')
    return {}
  }, [slug, searchParams])

  // Track page visits for dynamic mortgage pages
  useEffect(() => {
    if (Object.keys(urlParams).length > 0) {
      track('mortgage_page_visit', {
        loan_amount: urlParams.mortgage_amount?.toString() || 'unknown',
        term_years: urlParams.term_years?.toString() || 'unknown',
        interest_rate: urlParams.fixed_rate?.toString() || 'unknown',
        url_format: slug ? 'slug' : 'query',
        page_url: window.location.pathname,
        is_comprehensive_params: Object.keys(urlParams).length > 3,
      })
    }
  }, [urlParams, slug])

  // Generate pre-filled form data
  const preFilledFormData = useMemo(() => {
    console.log('URL params for form:', urlParams)
    if (!urlParams || Object.keys(urlParams).length === 0) {
      console.log('Using default form values')
      return defaultFormValues
    }

    const merged = {
      ...defaultFormValues,
      ...urlParams,
    }
    console.log('Pre-filled form data:', merged)
    return merged
  }, [urlParams])

  // SEO metadata
  const seoData = useMemo(() => {
    if (!urlParams || Object.keys(urlParams).length === 0) {
      return {
        title: 'Mortgage Calculator - MortgaSim',
        description: 'Calculate your mortgage payments with our advanced mortgage simulation tool.',
        ogTitle: 'Mortgage Calculator - MortgaSim',
        ogDescription: 'Calculate your mortgage payments with our advanced mortgage simulation tool.',
      }
    }

    const { mortgage_amount, term_years, fixed_rate } = urlParams
    const loanFormatted = mortgage_amount ? `£${(mortgage_amount / 1000).toFixed(0)}k` : ''
    const termFormatted = term_years ? `${term_years} years` : ''
    const rateFormatted = fixed_rate ? `${fixed_rate}%` : ''

    const title = `${loanFormatted} Mortgage over ${termFormatted} at ${rateFormatted} - MortgaSim`
    const description = `Calculate monthly payments for a ${loanFormatted} mortgage over ${termFormatted} at ${rateFormatted} interest rate. See total cost, savings growth, and net worth projections.`

    return {
      title,
      description,
      ogTitle: title,
      ogDescription: description,
    }
  }, [urlParams])

  // Update document title and meta tags
  useEffect(() => {
    document.title = seoData.title
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', seoData.description)

    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      document.head.appendChild(ogTitle)
    }
    ogTitle.setAttribute('content', seoData.ogTitle)

    let ogDescription = document.querySelector('meta[property="og:description"]')
    if (!ogDescription) {
      ogDescription = document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      document.head.appendChild(ogDescription)
    }
    ogDescription.setAttribute('content', seoData.ogDescription)

    // Add OG image if we have URL params
    if (urlParams && Object.keys(urlParams).length > 0) {
      let ogImage = document.querySelector('meta[property="og:image"]')
      if (!ogImage) {
        ogImage = document.createElement('meta')
        ogImage.setAttribute('property', 'og:image')
        document.head.appendChild(ogImage)
      }
      ogImage.setAttribute('content', `/api/og-image?loan=${urlParams.mortgage_amount}&term=${urlParams.term_years}&rate=${urlParams.fixed_rate}`)
    }
  }, [seoData, urlParams])

  // Mutation for running simulation
  const simulationMutation = useMutation({
    mutationFn: MortgageApiService.simulate,
    onSuccess: (data) => {
      setSimulationResults(data)
      setWarnings(data.warnings || [])
      
      // Track successful simulation
      track('mortgage_simulation_completed', {
        loan_amount: urlParams?.mortgage_amount?.toString() || 'unknown',
        term_years: urlParams?.term_years?.toString() || 'unknown',
        interest_rate: urlParams?.fixed_rate?.toString() || 'unknown',
        has_warnings: (data.warnings || []).length > 0,
        warnings_count: (data.warnings || []).length,
        auto_loaded: hasAutoLoaded,
      })
    },
    onError: (error) => {
      console.error('Simulation failed:', error)
      
      // Track simulation errors
      track('mortgage_simulation_error', {
        loan_amount: urlParams?.mortgage_amount?.toString() || 'unknown',
        term_years: urlParams?.term_years?.toString() || 'unknown',
        interest_rate: urlParams?.fixed_rate?.toString() || 'unknown',
        error_message: getErrorMessage(error),
        auto_loaded: hasAutoLoaded,
      })
    },
  })

  // Health check query
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: MortgageApiService.healthCheck,
    retry: 3,
    refetchInterval: 300000, // 5 minutes
  })

  // Auto-run simulation with URL parameters on mount
  useEffect(() => {
    const runInitialSimulation = async () => {
      if (!hasAutoLoaded && preFilledFormData) {
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
          console.error('Failed to auto-load simulation:', error)
        }
      }
    }

    runInitialSimulation()
  }, [hasAutoLoaded, preFilledFormData, simulationMutation])

  const handleFormSubmit = (formData: MortgageFormData) => {
    setCurrentStartDate(formData.start_date)
    const request = transformFormDataToRequest(formData)
    setLastSimulationRequest(request)
    
    // Track manual form submission
    track('mortgage_form_submitted', {
      loan_amount: formData.mortgage_amount.toString(),
      term_years: formData.term_years.toString(),
      fixed_rate: formData.fixed_rate.toString(),
      variable_rate: formData.variable_rate.toString(),
      initial_balance: formData.initial_balance.toString(),
      monthly_contribution: formData.monthly_contribution.toString(),
      is_manual_submission: true,
    })
    
    simulationMutation.mutate(request)
  }

  const handleExportCsv = async () => {
    if (!simulationResults || !lastSimulationRequest) return
    
    try {
      // Track CSV export attempt
      track('csv_export_started', {
        loan_amount: urlParams?.mortgage_amount?.toString() || 'unknown',
        term_years: urlParams?.term_years?.toString() || 'unknown',
        interest_rate: urlParams?.fixed_rate?.toString() || 'unknown',
      })
      
      const csvBlob = await MortgageApiService.exportCsv(lastSimulationRequest)
      
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
        loan_amount: urlParams?.mortgage_amount?.toString() || 'unknown',
        term_years: urlParams?.term_years?.toString() || 'unknown',
        interest_rate: urlParams?.fixed_rate?.toString() || 'unknown',
        file_size: csvBlob.size.toString(),
      })
    } catch (error) {
      console.error('Failed to export CSV:', error)
      
      // Track CSV export error
      track('csv_export_error', {
        loan_amount: urlParams?.mortgage_amount?.toString() || 'unknown',
        term_years: urlParams?.term_years?.toString() || 'unknown',
        interest_rate: urlParams?.fixed_rate?.toString() || 'unknown',
        error_message: getErrorMessage(error),
      })
    }
  }

  const handleShareLink = async () => {
    try {
      const shareableLink = generateShareableLink(preFilledFormData)
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
      {/* Header with SEO-optimized content */}
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
              <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 500 }} color="text.primary">
                {seoData.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {seoData.description}
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
              initialValues={preFilledFormData}
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
                      Calculating your personalized mortgage scenario.
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
                      Loading your mortgage simulation...
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
                      {urlParams ? 
                        'We\'re calculating the results for your specific mortgage scenario.' :
                        'We\'re loading a sample simulation to show you how the tool works.'
                      }
                    </Typography>
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