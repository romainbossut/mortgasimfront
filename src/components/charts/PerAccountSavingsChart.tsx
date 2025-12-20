import React, { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import {
  commonChartOptions,
  formatCurrency,
  formatCurrencyAbbreviated,
  yearsToDate,
  createTooltipTitle,
  getAccountColor,
} from '../../utils/chartSetup'
import type { AccountChartData } from '../../types/mortgage'

interface PerAccountSavingsChartProps {
  years: number[]
  accounts: AccountChartData[]
  selectedAccounts: string[]
  startDate: string
  birthDate?: string
}

export const PerAccountSavingsChart: React.FC<PerAccountSavingsChartProps> = ({
  years,
  accounts,
  selectedAccounts,
  startDate,
  birthDate,
}) => {
  const data = useMemo(() => {
    const dates = years.map((y) => yearsToDate(y, startDate))

    // Filter accounts by selection and create datasets
    const datasets = accounts
      .filter((account) => selectedAccounts.includes(account.name))
      .map((account) => {
        const originalIndex = accounts.findIndex((a) => a.name === account.name)
        const color = getAccountColor(originalIndex)

        // Sample account balance data to match years array
        // The account.balance array corresponds to monthly data, so we need to sample it
        const sampledBalance = years.map((year) => {
          const monthIndex = Math.round(year * 12)
          return account.balance[monthIndex] ?? account.balance[account.balance.length - 1] ?? 0
        })

        return {
          label: account.name,
          data: sampledBalance,
          borderColor: color,
          backgroundColor: `${color}20`,
          fill: false,
          tension: 0,
        }
      })

    return {
      labels: dates,
      datasets,
    }
  }, [years, accounts, selectedAccounts, startDate])

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
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y ?? 0)}`
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
        },
        y: {
          ...commonChartOptions.scales.y,
          ticks: {
            ...commonChartOptions.scales.y.ticks,
            callback: (value) => formatCurrencyAbbreviated(value as number),
          },
        },
      },
    }),
    [birthDate]
  )

  if (data.datasets.length === 0) {
    return null
  }

  return <Line data={data} options={options} />
}
