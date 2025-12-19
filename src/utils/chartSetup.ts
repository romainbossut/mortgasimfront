import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import 'chartjs-adapter-date-fns'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  annotationPlugin
)

// Configure global defaults to match MUI theme
ChartJS.defaults.font.family = '"Roboto", "Helvetica", "Arial", sans-serif'
ChartJS.defaults.font.size = 12
ChartJS.defaults.color = 'rgba(0, 0, 0, 0.87)'

// Chart colors matching the original MUI X Charts
export const chartColors = {
  mortgageBalance: '#f44336', // red
  savingsBalance: '#4caf50', // green
  netWorth: '#2196f3', // blue
  monthlyPayment: '#ff9800', // orange
  overpaymentLine: '#ff9800', // orange for overpayment annotations
  grid: 'rgba(0, 0, 0, 0.1)',
}

// Colors for multiple savings accounts (up to 10)
export const accountColors = [
  '#4caf50', // green
  '#2196f3', // blue
  '#9c27b0', // purple
  '#ff9800', // orange
  '#00bcd4', // cyan
  '#e91e63', // pink
  '#3f51b5', // indigo
  '#009688', // teal
  '#795548', // brown
  '#607d8b', // blue grey
]

export const getAccountColor = (index: number): string => {
  return accountColors[index % accountColors.length]
}

// Common chart options
export const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: 'rgba(0, 0, 0, 0.87)',
      bodyColor: 'rgba(0, 0, 0, 0.87)',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: chartColors.grid,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
  },
  elements: {
    line: {
      tension: 0.4, // Smooth curves (monotoneX equivalent)
      borderWidth: 3,
    },
    point: {
      radius: 0, // Hide points by default
      hoverRadius: 6,
    },
  },
}

// Format currency for tooltips
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Format currency abbreviated for Y-axis
export const formatCurrencyAbbreviated = (value: number): string => {
  if (value >= 1000000) {
    return `£${(value / 1000000).toFixed(1)}M`
  } else if (value >= 100000) {
    return `£${(value / 1000).toFixed(0)}K`
  } else if (value >= 10000) {
    return `£${(value / 1000).toFixed(1)}K`
  }
  return formatCurrency(value)
}

// Format for payment Y-axis (more compact)
export const formatYAxisPayment = (value: number): string => {
  if (value >= 1000) {
    return `£${(value / 1000).toFixed(1)}k`
  }
  return `£${value.toFixed(0)}`
}

// Format date for X-axis labels
export const formatDateLabel = (date: Date): string => {
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

// Convert years (decimal) to Date
export const yearsToDate = (years: number, startDate: string): Date => {
  const start = new Date(startDate)
  const monthsToAdd = Math.round(years * 12)
  const result = new Date(start)
  result.setMonth(result.getMonth() + monthsToAdd)
  return result
}

// Convert period index (1-based) to Date
export const periodIndexToDate = (periodIndex: number, startDate: string): Date => {
  const start = new Date(startDate)
  const result = new Date(start)
  result.setMonth(result.getMonth() + periodIndex - 1)
  return result
}

// Convert Date to period index (1-based)
export const dateToPeriodIndex = (date: Date, startDate: string): number => {
  const start = new Date(startDate)
  const monthsDiff =
    (date.getFullYear() - start.getFullYear()) * 12 + (date.getMonth() - start.getMonth())
  return monthsDiff + 1
}

// Create annotation config for overpayment line
export const createOverpaymentAnnotation = (
  date: Date,
  amount: number,
  id: string,
  isEditing: boolean = false
) => ({
  type: 'line' as const,
  scaleID: 'x',
  value: date.getTime(),
  borderColor: isEditing ? '#e65100' : chartColors.overpaymentLine,
  borderWidth: isEditing ? 3 : 2,
  borderDash: [6, 6],
  label: {
    display: true,
    content: `£${amount.toLocaleString()}`,
    position: 'start' as const,
    backgroundColor: isEditing ? '#e65100' : chartColors.overpaymentLine,
    color: 'white',
    font: {
      size: 11,
      weight: 'bold' as const,
    },
    padding: { top: 4, bottom: 4, left: 8, right: 8 },
    borderRadius: 4,
  },
  id,
})
