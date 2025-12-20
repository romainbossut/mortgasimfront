import React, { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import {
  commonChartOptions,
  yearsToDate,
  createTooltipTitle,
} from '../../utils/chartSetup'

interface LTVChartProps {
  years: number[]
  ltvValues: number[]
  startDate: string
  birthDate?: string
}

export const LTVChart: React.FC<LTVChartProps> = ({
  years,
  ltvValues,
  startDate,
  birthDate,
}) => {
  const data = useMemo(() => {
    const dates = years.map((y) => yearsToDate(y, startDate))

    return {
      labels: dates,
      datasets: [
        {
          label: 'LTV',
          data: ltvValues,
          borderColor: '#9c27b0',
          backgroundColor: 'rgba(156, 39, 176, 0.1)',
          fill: true,
          tension: 0,
        },
      ],
    }
  }, [years, ltvValues, startDate])

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
              return `LTV: ${(context.parsed.y ?? 0).toFixed(1)}%`
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
          min: 0,
          max: 100,
          ticks: {
            ...commonChartOptions.scales.y.ticks,
            callback: (value) => `${value}%`,
          },
        },
      },
    }),
    [birthDate]
  )

  return <Line data={data} options={options} />
}
