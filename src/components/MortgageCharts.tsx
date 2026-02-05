import React, { useMemo, useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import { InfoOutlined } from '@mui/icons-material'
import type { ChartData, SummaryStatistics } from '../types/mortgage'

// Import Chart.js setup (registers components)
import '../utils/chartSetup'
import { getAccountColor } from '../utils/chartSetup'

// Import Chart.js components
import { InteractiveBalanceChart, NetWorthChart, PaymentScheduleChart, LTVChart, PerAccountSavingsChart } from './charts'

interface MortgageChartsProps {
  chartData: ChartData
  summaryStats: SummaryStatistics
  startDate: string // Start date in YYYY-MM-DD format
  birthYear?: number // Optional birth year for age display on charts
  assetValue: number // Property value for LTV calculation
  notes?: string[] // Notes/warnings to display under summary
  isLoading?: boolean
  isRecalculating?: boolean // Show subtle indicator when recalculating due to overpayment changes
}

export const MortgageCharts: React.FC<MortgageChartsProps> = ({
  chartData,
  summaryStats,
  startDate,
  birthYear,
  assetValue,
  notes,
  isLoading = false,
  isRecalculating = false,
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

  // State for selected accounts in per-account chart
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])

  // Initialize selected accounts when chart data changes
  useEffect(() => {
    if (chartData?.accounts && chartData.accounts.length > 0) {
      setSelectedAccounts(chartData.accounts.map((acc) => acc.name))
    }
  }, [chartData?.accounts])

  // Toggle account selection
  const handleAccountToggle = (accountName: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountName)
        ? prev.filter((name) => name !== accountName)
        : [...prev, accountName]
    )
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

  // Process data for charts with sampling for performance
  const processedData = useMemo(() => {
    if (!chartData || chartData.years.length === 0) {
      return {
        years: [],
        mortgageBalance: [],
        savingsBalance: [],
        netWorth: [],
        monthlyPayments: [],
        ltv: [],
        maxPeriod: 0,
      }
    }

    // Use all data points for monthly granularity (up to 500 points)
    // For very long simulations, sample to maintain performance
    const maxPoints = 500
    const totalPoints = chartData.years.length
    const step = totalPoints > maxPoints ? Math.ceil(totalPoints / maxPoints) : 1

    const sampledIndices: number[] = []
    for (let i = 0; i < totalPoints; i += step) {
      sampledIndices.push(i)
    }

    // Always include the last point
    if (sampledIndices[sampledIndices.length - 1] !== totalPoints - 1) {
      sampledIndices.push(totalPoints - 1)
    }

    const mortgageBalances = sampledIndices.map((i) => chartData.mortgage_balance[i])

    return {
      years: sampledIndices.map((i) => chartData.years[i]),
      mortgageBalance: mortgageBalances,
      savingsBalance: sampledIndices.map((i) => chartData.savings_balance[i]),
      netWorth: sampledIndices.map((i) => chartData.net_worth[i]),
      monthlyPayments: sampledIndices.map((i) => chartData.monthly_payments[i]),
      ltv: mortgageBalances.map((balance) => assetValue > 0 ? (balance / assetValue) * 100 : 0),
      maxPeriod: Math.round(chartData.years[chartData.years.length - 1] * 12),
    }
  }, [chartData, assetValue])

  if (processedData.years.length === 0) {
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'relative' }}>
      {/* Recalculating overlay */}
      {isRecalculating && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: 'rgba(255,255,255,0.9)',
            px: 2,
            py: 1,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <CircularProgress size={16} />
          <Typography variant="caption" color="text.secondary">
            Recalculating...
          </Typography>
        </Box>
      )}

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

          {/* Per-account summaries */}
          {summaryStats.account_summaries && summaryStats.account_summaries.length > 1 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Account Breakdown
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: `repeat(${Math.min(summaryStats.account_summaries.length, 4)}, 1fr)` },
                  gap: 2,
                }}
              >
                {summaryStats.account_summaries.map((account, index) => (
                  <Box
                    key={account.name}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: getAccountColor(index),
                      backgroundColor: `${getAccountColor(index)}08`,
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium" sx={{ color: getAccountColor(index), mb: 0.5 }}>
                      {account.name}
                    </Typography>
                    <Typography variant="body2">
                      Balance: {formatCurrency(account.final_balance)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Interest: {formatCurrency(account.total_interest_earned)}
                    </Typography>
                  </Box>
                ))}
              </Box>
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
                    width: '100%',
                  },
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

      {/* Interactive Balances Chart */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Mortgage vs Savings Balance Over Time
          </Typography>
          <Box sx={{ height: 350 }}>
            <InteractiveBalanceChart
              years={processedData.years}
              mortgageBalance={processedData.mortgageBalance}
              savingsBalance={processedData.savingsBalance}
              startDate={startDate}
              birthYear={birthYear}
              maxPeriod={processedData.maxPeriod}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Net Worth Chart */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Net Worth Evolution
          </Typography>
          <Box sx={{ height: 350 }}>
            <NetWorthChart
              years={processedData.years}
              netWorth={processedData.netWorth}
              startDate={startDate}
              birthYear={birthYear}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Per-Account Savings Chart - only show when multiple accounts exist */}
      {chartData.accounts && chartData.accounts.length > 1 && (
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
              Savings by Account
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {chartData.accounts.map((account, index) => (
                <Chip
                  key={account.name}
                  label={account.name}
                  onClick={() => handleAccountToggle(account.name)}
                  variant={selectedAccounts.includes(account.name) ? 'filled' : 'outlined'}
                  sx={{
                    backgroundColor: selectedAccounts.includes(account.name)
                      ? getAccountColor(index)
                      : 'transparent',
                    borderColor: getAccountColor(index),
                    color: selectedAccounts.includes(account.name) ? 'white' : getAccountColor(index),
                    '&:hover': {
                      backgroundColor: selectedAccounts.includes(account.name)
                        ? getAccountColor(index)
                        : `${getAccountColor(index)}20`,
                    },
                  }}
                />
              ))}
            </Box>
            <Box sx={{ height: 350 }}>
              <PerAccountSavingsChart
                years={processedData.years}
                accounts={chartData.accounts}
                selectedAccounts={selectedAccounts}
                startDate={startDate}
                birthYear={birthYear}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* LTV Chart */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Loan-to-Value (LTV) Ratio
          </Typography>
          <Box sx={{ height: 350 }}>
            <LTVChart
              years={processedData.years}
              ltvValues={processedData.ltv}
              startDate={startDate}
              birthYear={birthYear}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Monthly Payment Chart */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Monthly Payment Schedule
          </Typography>
          <Box sx={{ height: 350 }}>
            <PaymentScheduleChart
              years={processedData.years}
              monthlyPayments={processedData.monthlyPayments}
              startDate={startDate}
              birthYear={birthYear}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Financial Position at Key Years Table */}
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
    </Box>
  )
}
