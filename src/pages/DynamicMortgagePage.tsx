import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
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
} from '@mui/material'
import {
  CheckCircle,
  Error,
  FileDownload,
  CloudOff,
  TrendingUp,
} from '@mui/icons-material'
import { MortgageForm } from '../components/MortgageForm'
import { MortgageCharts } from '../components/MortgageCharts'
import { Footer } from '../components/Footer'
import { MortgageApiService, transformFormDataToRequest } from '../services/mortgageApi'
import { parseMortgageSlug, parseMortgageQuery } from '../utils/urlParser'
import { defaultFormValues } from '../utils/validation'
import type { MortgageFormData } from '../utils/validation'
import type { SimulationResponse, SimulationRequest } from '../types/mortgage'

export const DynamicMortgagePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const [simulationResults, setSimulationResults] = useState<SimulationResponse | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [currentStartDate, setCurrentStartDate] = useState<string>('')
  const [lastSimulationRequest, setLastSimulationRequest] = useState<SimulationRequest | null>(null)
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false)

  // Parse URL parameters
  const urlParams = useMemo(() => {
    if (slug) {
      return parseMortgageSlug(slug)
    }
    return parseMortgageQuery(searchParams)
  }, [slug, searchParams])

  // Generate pre-filled form data
  const preFilledFormData = useMemo(() => {
    if (!urlParams || (!urlParams.loan && !urlParams.term && !urlParams.rate)) {
      return defaultFormValues
    }

    return {
      ...defaultFormValues,
      mortgage_amount: urlParams.loan || defaultFormValues.mortgage_amount,
      term_years: urlParams.term || defaultFormValues.term_years,
      fixed_rate: urlParams.rate || defaultFormValues.fixed_rate,
      variable_rate: urlParams.rate || defaultFormValues.variable_rate,
    }
  }, [urlParams])

  // SEO metadata
  const seoData = useMemo(() => {
    if (!urlParams) {
      return {
        title: 'Mortgage Calculator - MortgaSim',
        description: 'Calculate your mortgage payments with our advanced mortgage simulation tool.',
        ogTitle: 'Mortgage Calculator - MortgaSim',
        ogDescription: 'Calculate your mortgage payments with our advanced mortgage simulation tool.',
      }
    }

    const { loan, term, rate } = urlParams
    const loanFormatted = loan ? `£${(loan / 1000).toFixed(0)}k` : ''
    const termFormatted = term ? `${term} years` : ''
    const rateFormatted = rate ? `${rate}%` : ''

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
    if (urlParams) {
      let ogImage = document.querySelector('meta[property="og:image"]')
      if (!ogImage) {
        ogImage = document.createElement('meta')
        ogImage.setAttribute('property', 'og:image')
        document.head.appendChild(ogImage)
      }
      ogImage.setAttribute('content', `/api/og-image?loan=${urlParams.loan}&term=${urlParams.term}&rate=${urlParams.rate}`)
    }
  }, [seoData, urlParams])

  // Mutation for running simulation
  const simulationMutation = useMutation({
    mutationFn: MortgageApiService.simulate,
    onSuccess: (data) => {
      setSimulationResults(data)
      setWarnings(data.warnings || [])
    },
    onError: (error) => {
      console.error('Simulation failed:', error)
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
    simulationMutation.mutate(request)
  }

  const handleExportCsv = async () => {
    if (!simulationResults || !lastSimulationRequest) return
    
    try {
      const csvBlob = await MortgageApiService.exportCsv(lastSimulationRequest)
      
      const url = window.URL.createObjectURL(csvBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `mortgage-simulation-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export CSV:', error)
    }
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
              {simulationMutation.error instanceof Error
                ? simulationMutation.error.message
                : 'An unexpected error occurred. Please try again.'}
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
    </Box>
  )
} 