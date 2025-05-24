import React, { useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import { InfoOutlined } from '@mui/icons-material'
import type { ChartData, SummaryStatistics } from '../types/mortgage'

interface MortgageChartsProps {
  chartData: ChartData
  summaryStats: SummaryStatistics
  startDate: string // Start date in YYYY-MM-DD format
  notes?: string[] // Notes/warnings to display under summary
  isLoading?: boolean
}

export const MortgageCharts: React.FC<MortgageChartsProps> = ({
  chartData,
  summaryStats,
  startDate,
  notes,
  isLoading = false,
}) => {
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format currency for large amounts (mortgage/savings balances)
  const formatCurrencyAbbreviated = (value: number) => {
    if (value >= 1000000) {
      return `£${(value / 1000000).toFixed(1)}M`
    } else if (value >= 100000) {
      return `£${(value / 1000).toFixed(0)}K`
    } else if (value >= 10000) {
      return `£${(value / 1000).toFixed(1)}K`
    }
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format currency for monthly payments (no abbreviations for clarity)
  const formatMonthlyPayment = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format currency for Y-axis labels (more compact)
  const formatYAxisPayment = (value: number) => {
    if (value >= 1000) {
      return `£${(value / 1000).toFixed(1)}k`
    }
    return `£${value.toFixed(0)}`
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Card>
          <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </CardContent>
        </Card>
      </Box>
    )
  }

  // Create summary table data for specific years
  const summaryTableData = useMemo(() => {
    if (!chartData || chartData.years.length === 0) {
      return []
    }

    const targetYears = [1, 2, 3, 4, 5, 10]
    const tableRows: Array<{
      id: number
      year: number
      date: string
      mortgageBalance: number
      savingsBalance: number
      netWorth: number
      monthlyPayment: number
    }> = []

    targetYears.forEach((targetYear, index) => {
      // Find the closest data point to the target year
      let closestIndex = 0
      let minDiff = Math.abs(chartData.years[0] - targetYear)
      
      for (let i = 1; i < chartData.years.length; i++) {
        const diff = Math.abs(chartData.years[i] - targetYear)
        if (diff < minDiff) {
          minDiff = diff
          closestIndex = i
        }
      }

      // Only include if we have data reasonably close to the target year (within 6 months)
      if (minDiff <= 0.5) {
        const baseDate = new Date(startDate)
        const targetDate = new Date(baseDate)
        targetDate.setMonth(targetDate.getMonth() + Math.round(targetYear * 12))

        tableRows.push({
          id: index + 1,
          year: targetYear,
          date: targetDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
          mortgageBalance: chartData.mortgage_balance[closestIndex],
          savingsBalance: chartData.savings_balance[closestIndex],
          netWorth: chartData.net_worth[closestIndex],
          monthlyPayment: chartData.monthly_payments[closestIndex],
        })
      }
    })

    return tableRows
  }, [chartData, startDate])

  // Define columns for the summary table
  const summaryTableColumns: GridColDef[] = [
    {
      field: 'year',
      headerName: 'Year',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'mortgageBalance',
      headerName: 'Mortgage Balance',
      width: 140,
      align: 'right',
      headerAlign: 'center',
      valueFormatter: (value: number) => formatCurrency(value),
    },
    {
      field: 'savingsBalance',
      headerName: 'Savings Balance',
      width: 140,
      align: 'right',
      headerAlign: 'center',
      valueFormatter: (value: number) => formatCurrency(value),
    },
    {
      field: 'netWorth',
      headerName: 'Net Worth',
      width: 140,
      align: 'right',
      headerAlign: 'center',
      valueFormatter: (value: number) => formatCurrency(value),
    },
    {
      field: 'monthlyPayment',
      headerName: 'Monthly Payment',
      width: 140,
      align: 'right',
      headerAlign: 'center',
      valueFormatter: (value: number) => formatCurrency(value),
    },
  ]

  // Convert data for charts with actual dates
  const processedData = useMemo(() => {
    if (!chartData || chartData.years.length === 0) {
      return {
        xAxisData: [],
        mortgageData: [],
        savingsData: [],
        netWorthData: [],
        monthlyPaymentData: [],
      }
    }

    // Sample data for better performance with large datasets
    const maxPoints = 50
    const totalPoints = chartData.years.length
    const step = totalPoints > maxPoints ? Math.ceil(totalPoints / maxPoints) : 1
    
    const sampledIndices = []
    for (let i = 0; i < totalPoints; i += step) {
      sampledIndices.push(i)
    }
    
    // Always include the last point
    if (sampledIndices[sampledIndices.length - 1] !== totalPoints - 1) {
      sampledIndices.push(totalPoints - 1)
    }

    // Parse the start date and create actual dates by adding relative years
    const baseDate = new Date(startDate)
    const xAxisData = sampledIndices.map(i => {
      const relativeYears = chartData.years[i]
      // Convert relative years to months and add to start date
      const monthsToAdd = Math.round(relativeYears * 12)
      const resultDate = new Date(baseDate)
      resultDate.setMonth(resultDate.getMonth() + monthsToAdd)
      return resultDate
    })

    return {
      xAxisData,
      mortgageData: sampledIndices.map(i => chartData.mortgage_balance[i]),
      savingsData: sampledIndices.map(i => chartData.savings_balance[i]),
      netWorthData: sampledIndices.map(i => chartData.net_worth[i]),
      monthlyPaymentData: sampledIndices.map(i => chartData.monthly_payments[i]),
    }
  }, [chartData, startDate])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'short' 
    })
  }

  const chartStyles = {
    '& .MuiChartsAxis-tick': {
      fontSize: '0.75rem',
      fill: '#666',
    },
    '& .MuiChartsAxis-tickLabel': {
      fontSize: '0.75rem',
      fill: '#666',
    },
    '& .MuiChartsAxis-label': {
      fontSize: '0.875rem',
      fontWeight: 500,
      fill: '#333',
    },
    '& .MuiChartsLegend-mark': {
      rx: 2,
    },
    '& .MuiChartsTooltip-paper': {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(4px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      border: '1px solid #e0e0e0',
    },
    '& .MuiChartsLine-root': {
      strokeWidth: 3,
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
    },
    '& .MuiChartsAreaElement-root': {
      fillOpacity: 0.1,
    },
    // Remove dots
    '& .MuiChartsLine-mark': {
      display: 'none',
    },
    '& .MuiChartsMarkElement-root': {
      display: 'none',
    },
  }

  const chartConfig = {
    height: 350,
    margin: { left: 80, right: 80, top: 20, bottom: 60 },
    grid: { horizontal: true, vertical: false },
    curve: 'monotoneX' as const,
    sx: chartStyles,
  }

  if (processedData.xAxisData.length === 0) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            No data to display
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please run a simulation to see charts.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Summary Statistics */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Summary Statistics
          </Typography>
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {formatCurrency(summaryStats.final_net_worth)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Final Net Worth
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {formatCurrency(summaryStats.final_savings_balance)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Final Savings Balance
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {formatCurrency(summaryStats.final_mortgage_balance)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Final Mortgage Balance
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h4" color="secondary.main" fontWeight="bold">
                {formatCurrency(summaryStats.min_savings_balance)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Minimum Savings
              </Typography>
            </Box>
          </Box>
          
          {summaryStats.mortgage_paid_off_month && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Chip
                label={`Mortgage paid off in month ${summaryStats.mortgage_paid_off_month}`}
                color="success"
                variant="outlined"
                sx={{ fontSize: '0.875rem' }}
              />
            </Box>
          )}

          {notes && notes.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Alert 
                severity="info" 
                icon={<InfoOutlined />}
                sx={{ 
                  textAlign: 'left',
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
              >
                <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                  Notes
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  {notes.map((note, index) => (
                    <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                      {note}
                    </Typography>
                  ))}
                </Box>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Summary Table */}
      {summaryTableData.length > 0 && (
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Financial Position at Key Years
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              View your mortgage balance, savings, net worth, and monthly payments at specific years
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={summaryTableData}
                columns={summaryTableColumns}
                hideFooter
                disableRowSelectionOnClick
                disableColumnMenu
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f0f0f0',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0',
                    fontWeight: 600,
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Balances Chart */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Mortgage vs Savings Balance Over Time
          </Typography>
          <LineChart
            xAxis={[{
              scaleType: 'time',
              data: processedData.xAxisData,
              valueFormatter: formatDate,
              tickLabelStyle: { fontSize: '0.75rem' },
            }]}
            series={[
              {
                data: processedData.mortgageData,
                label: 'Mortgage Balance',
                color: '#f44336',
                valueFormatter: (value: number | null) => value !== null ? formatCurrency(value) : '',
              },
              {
                data: processedData.savingsData,
                label: 'Savings Balance',
                color: '#4caf50',
                valueFormatter: (value: number | null) => value !== null ? formatCurrency(value) : '',
              },
            ]}
            yAxis={[{
              valueFormatter: formatCurrencyAbbreviated,
              tickLabelStyle: { fontSize: '0.75rem' },
            }]}
            {...chartConfig}
          />
        </CardContent>
      </Card>

      {/* Net Worth Chart */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Net Worth Evolution
          </Typography>
          <LineChart
            xAxis={[{
              scaleType: 'time',
              data: processedData.xAxisData,
              valueFormatter: formatDate,
              tickLabelStyle: { fontSize: '0.75rem' },
            }]}
            series={[
              {
                data: processedData.netWorthData,
                label: 'Net Worth',
                color: '#2196f3',
                valueFormatter: (value: number | null) => value !== null ? formatCurrency(value) : '',
              },
            ]}
            yAxis={[{
              valueFormatter: formatCurrencyAbbreviated,
              tickLabelStyle: { fontSize: '0.75rem' },
            }]}
            {...chartConfig}
          />
        </CardContent>
      </Card>

      {/* Monthly Payment Chart */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Monthly Payment Schedule
          </Typography>
          <LineChart
            xAxis={[{
              scaleType: 'time',
              data: processedData.xAxisData,
              valueFormatter: formatDate,
              tickLabelStyle: { fontSize: '0.75rem' },
            }]}
            series={[
              {
                data: processedData.monthlyPaymentData,
                label: 'Monthly Payment',
                color: '#ff9800',
                valueFormatter: (value: number | null) => value !== null ? formatMonthlyPayment(value) : '',
              },
            ]}
            yAxis={[{
              valueFormatter: formatYAxisPayment,
              tickLabelStyle: { fontSize: '0.75rem' },
            }]}
            {...chartConfig}
          />
        </CardContent>
      </Card>
    </Box>
  )
} 