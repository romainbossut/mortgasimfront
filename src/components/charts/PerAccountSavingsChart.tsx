import React, { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import {
  commonChartOptions,
  formatCurrency,
  formatCurrencyAbbreviated,
  yearsToDate,
  formatDateLabel,
  getAccountColor,
} from '../../utils/chartSetup'
import type { AccountChartData } from '../../types/mortgage'

interface PerAccountSavingsChartProps {
  years: number[]
  accounts: AccountChartData[]
  selectedAccounts: string[]
  startDate: string
  birthYear?: number
}

export const PerAccountSavingsChart: React.FC<PerAccountSavingsChartProps> = ({
  years,
  accounts,
  selectedAccounts,
  startDate,
  birthYear,
}) => {
  const startingAge = birthYear ? new Date(startDate).getFullYear() - birthYear : undefined

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
                const date = new Date(items[0].parsed.x)
                let title = formatDateLabel(date)
                if (startingAge !== undefined) {
                  const yearsFromStart = (date.getTime() - new Date(startDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
                  const age = Math.floor(startingAge + yearsFromStart)
                  title += ` (Age ${age})`
                }
                return title
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
        xAge: startingAge !== undefined ? {
          type: 'linear' as const,
          position: 'top' as const,
          title: {
            display: true,
            text: 'Age',
            font: { size: 11 },
          },
          min: startingAge,
          max: startingAge + (years.length > 0 ? years[years.length - 1] : 0),
          ticks: {
            stepSize: 5,
            callback: (value) => Math.floor(value as number),
          },
          grid: {
            display: false,
          },
        } : undefined,
        y: {
          ...commonChartOptions.scales.y,
          ticks: {
            ...commonChartOptions.scales.y.ticks,
            callback: (value) => formatCurrencyAbbreviated(value as number),
          },
        },
      },
    }),
    [startingAge, startDate, years]
  )

  if (data.datasets.length === 0) {
    return null
  }

  return <Line data={data} options={options} />
}
