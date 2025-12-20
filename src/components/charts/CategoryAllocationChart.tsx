import React, { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import {
  commonChartOptions,
  yearsToDate,
  createTooltipTitle,
  formatCurrency,
} from '../../utils/chartSetup'
import type { AccountChartData, AccountCategory } from '../../types/mortgage'

interface CategoryAllocationChartProps {
  years: number[]
  accounts: AccountChartData[]
  startDate: string
  birthDate?: string
}

// Category display configuration
const CATEGORY_CONFIG: Record<AccountCategory, { label: string; color: string }> = {
  cash_savings: { label: 'Cash Savings', color: '#4caf50' },
  cash_isa: { label: 'Cash ISA', color: '#2196f3' },
  investment: { label: 'Investment', color: '#9c27b0' },
}

export const CategoryAllocationChart: React.FC<CategoryAllocationChartProps> = ({
  years,
  accounts,
  startDate,
  birthDate,
}) => {
  // Group accounts by category and calculate totals
  const categoryData = useMemo(() => {
    const categories: AccountCategory[] = ['cash_savings', 'cash_isa', 'investment']

    // Initialize category totals
    const categoryTotals: Record<AccountCategory, number[]> = {
      cash_savings: new Array(years.length).fill(0),
      cash_isa: new Array(years.length).fill(0),
      investment: new Array(years.length).fill(0),
    }

    // Sum up balances by category
    accounts.forEach((account) => {
      const category = account.category || 'cash_savings'
      years.forEach((year, idx) => {
        const monthIndex = Math.round(year * 12)
        const balance = account.balance[monthIndex] ?? account.balance[account.balance.length - 1] ?? 0
        categoryTotals[category][idx] += balance
      })
    })

    // Check which categories have data
    const activeCategories = categories.filter((cat) =>
      categoryTotals[cat].some((val) => val > 0)
    )

    return { categoryTotals, activeCategories }
  }, [years, accounts])

  const data = useMemo(() => {
    const dates = years.map((y) => yearsToDate(y, startDate))

    const datasets = categoryData.activeCategories.map((category) => ({
      label: CATEGORY_CONFIG[category].label,
      data: categoryData.categoryTotals[category],
      borderColor: CATEGORY_CONFIG[category].color,
      backgroundColor: `${CATEGORY_CONFIG[category].color}60`,
      fill: true,
      tension: 0,
      stack: 'stack0',
    }))

    return {
      labels: dates,
      datasets,
    }
  }, [years, startDate, categoryData])

  const options: ChartOptions<'line'> = useMemo(
    () => ({
      ...commonChartOptions,
      plugins: {
        ...commonChartOptions.plugins,
        tooltip: {
          ...commonChartOptions.plugins.tooltip,
          callbacks: {
            title: (items) => {
              if (items.length > 0 && items[0].parsed.x !== null) {
                return createTooltipTitle(new Date(items[0].parsed.x), birthDate)
              }
              return ''
            },
            label: (context) => {
              const value = context.parsed.y ?? 0
              // Calculate total for percentage
              const dataIndex = context.dataIndex
              let total = 0
              categoryData.activeCategories.forEach((cat) => {
                total += categoryData.categoryTotals[cat][dataIndex] || 0
              })
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
              return `${context.dataset.label}: ${formatCurrency(value)} (${percentage}%)`
            },
            footer: (items) => {
              if (items.length > 0) {
                const dataIndex = items[0].dataIndex
                let total = 0
                categoryData.activeCategories.forEach((cat) => {
                  total += categoryData.categoryTotals[cat][dataIndex] || 0
                })
                return `Total: ${formatCurrency(total)}`
              }
              return ''
            },
          },
        },
      },
      scales: {
        x: {
          ...commonChartOptions.scales.x,
          type: 'time',
          time: {
            unit: 'month',
            displayFormats: {
              month: 'MMM yyyy',
            },
          },
          ticks: {
            ...commonChartOptions.scales.x.ticks,
            maxTicksLimit: 12,
          },
          stacked: true,
        },
        y: {
          ...commonChartOptions.scales.y,
          stacked: true,
          ticks: {
            ...commonChartOptions.scales.y.ticks,
            callback: (value) => {
              const numValue = value as number
              if (numValue >= 1000000) {
                return `£${(numValue / 1000000).toFixed(1)}M`
              } else if (numValue >= 1000) {
                return `£${(numValue / 1000).toFixed(0)}K`
              }
              return `£${numValue}`
            },
          },
        },
      },
    }),
    [birthDate, categoryData]
  )

  // Don't render if no data or only one category with no meaningful data
  if (categoryData.activeCategories.length === 0) {
    return null
  }

  return <Line data={data} options={options} />
}
