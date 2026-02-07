import React, { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import {
  chartColors,
  commonChartOptions,
  formatCurrency,
  formatCurrencyAbbreviated,
  yearsToDate,
  formatDateLabel,
} from '../../utils/chartSetup'

interface NetWorthChartProps {
  years: number[]
  netWorth: number[]
  startDate: string
  birthYear?: number
}

export const NetWorthChart: React.FC<NetWorthChartProps> = ({ years, netWorth, startDate, birthYear }) => {
  // Calculate starting age if birth year is provided
  const startingAge = birthYear ? new Date(startDate).getFullYear() - birthYear : undefined
  const data = useMemo(() => {
    const dates = years.map((y) => yearsToDate(y, startDate))

    return {
      labels: dates,
      datasets: [
        {
          label: 'Net Worth',
          data: netWorth,
          borderColor: chartColors.netWorth,
          backgroundColor: `${chartColors.netWorth}20`,
          fill: true,
          tension: 0,
        },
      ],
    }
  }, [years, netWorth, startDate])

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
              return `Net Worth: ${formatCurrency(context.parsed.y ?? 0)}`
            },
          },
        },
      },
      scales: {
        x: {
          ...commonChartOptions.scales.x,
          type: 'time',
          time: {
            unit: 'quarter',
            displayFormats: {
              quarter: 'MMM yyyy',
            },
          },
          ticks: {
            ...commonChartOptions.scales.x.ticks,
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

  return <Line data={data} options={options} />
}
