import React, { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import {
  chartColors,
  commonChartOptions,
  formatCurrency,
  formatCurrencyAbbreviated,
  yearsToDate,
  createTooltipTitle,
} from '../../utils/chartSetup'

interface NetWorthChartProps {
  years: number[]
  netWorth: number[]
  startDate: string
  birthDate?: string
}

export const NetWorthChart: React.FC<NetWorthChartProps> = ({ years, netWorth, startDate, birthDate }) => {
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
                return createTooltipTitle(new Date(items[0].parsed.x), birthDate)
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

  return <Line data={data} options={options} />
}
