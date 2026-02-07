import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import type { ChartOptions, Chart as ChartJS } from 'chart.js'
import { Box, Typography } from '@mui/material'
import {
  chartColors,
  commonChartOptions,
  formatCurrency,
  formatCurrencyAbbreviated,
  yearsToDate,
  formatDateLabel,
  periodIndexToDate,
  dateToPeriodIndex,
  createOverpaymentAnnotation,
} from '../../utils/chartSetup'
import { useOverpaymentStore, type ChartOverpayment } from '../../store/overpaymentStore'
import { OverpaymentPopover } from './OverpaymentPopover'

interface InteractiveBalanceChartProps {
  years: number[]
  mortgageBalance: number[]
  savingsBalance: number[]
  startDate: string
  birthYear?: number
  maxPeriod: number // Maximum period index (total months in simulation)
}

// Threshold in pixels for detecting click on annotation line
const LINE_HIT_THRESHOLD = 20

export const InteractiveBalanceChart: React.FC<InteractiveBalanceChartProps> = ({
  years,
  mortgageBalance,
  savingsBalance,
  startDate,
  birthYear,
  maxPeriod,
}) => {
  // Calculate starting age if birth year is provided
  const startingAge = birthYear ? new Date(startDate).getFullYear() - birthYear : undefined
  const chartRef = useRef<ChartJS<'line'>>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null)

  // Local state for interactions
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null)
  const [pendingOverpayment, setPendingOverpayment] = useState<ChartOverpayment | null>(null)
  const [isNewOverpayment, setIsNewOverpayment] = useState(false)
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    overpaymentId: string | null
  }>({ isDragging: false, overpaymentId: null })
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  // Zustand store
  const {
    chartOverpayments,
    editingId,
    setStartDate,
    addOverpayment,
    updateOverpayment,
    removeOverpayment,
    setEditingId,
    setDragging,
  } = useOverpaymentStore()

  // Set start date in store when it changes
  useEffect(() => {
    setStartDate(startDate)
  }, [startDate, setStartDate])

  // Convert pixel X position to period index
  const pixelToPeriodIndex = useCallback(
    (pixelX: number): number | null => {
      const chart = chartRef.current
      if (!chart) return null

      const xScale = chart.scales.x
      const timestamp = xScale.getValueForPixel(pixelX)
      if (timestamp === undefined) return null

      const date = new Date(timestamp)
      const periodIndex = dateToPeriodIndex(date, startDate)

      // Clamp to valid range
      return Math.max(1, Math.min(maxPeriod, Math.round(periodIndex)))
    },
    [startDate, maxPeriod]
  )

  // Convert period index to pixel X position
  const periodIndexToPixel = useCallback(
    (periodIndex: number): number | null => {
      const chart = chartRef.current
      if (!chart) return null

      const date = periodIndexToDate(periodIndex, startDate)
      const xScale = chart.scales.x
      return xScale.getPixelForValue(date.getTime())
    },
    [startDate]
  )

  // Find overpayment near a pixel position
  const findOverpaymentAtPixel = useCallback(
    (pixelX: number): ChartOverpayment | null => {
      for (const op of chartOverpayments) {
        const opPixelX = periodIndexToPixel(op.periodIndex)
        if (opPixelX !== null && Math.abs(pixelX - opPixelX) < LINE_HIT_THRESHOLD) {
          return op
        }
      }
      return null
    },
    [chartOverpayments, periodIndexToPixel]
  )

  // Handle chart click
  const handleChartClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (dragState.isDragging) return

      const chart = chartRef.current
      if (!chart) return

      const rect = chart.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left

      // Check if clicking on chart area (not on axis labels)
      const chartArea = chart.chartArea
      if (x < chartArea.left || x > chartArea.right) return

      // Check if clicking on existing overpayment line
      const existingOp = findOverpaymentAtPixel(x)

      if (existingOp) {
        // Edit existing overpayment
        setPendingOverpayment({ ...existingOp })
        setIsNewOverpayment(false)
        setEditingId(existingOp.id)
        setPopoverAnchor(chart.canvas)
      } else {
        // Add new overpayment
        const periodIndex = pixelToPeriodIndex(x)
        if (periodIndex === null) return

        const date = periodIndexToDate(periodIndex, startDate)
        const dateLabel = formatDateLabel(date)

        const newOp: ChartOverpayment = {
          id: `temp-${Date.now()}`,
          periodIndex,
          amount: 0,
          dateLabel,
          isDragging: false,
        }

        setPendingOverpayment(newOp)
        setIsNewOverpayment(true)
        setPopoverAnchor(chart.canvas)
      }
    },
    [dragState.isDragging, findOverpaymentAtPixel, pixelToPeriodIndex, startDate, setEditingId]
  )

  // Handle mouse down for drag
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const chart = chartRef.current
      if (!chart) return

      const rect = chart.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left

      const overpayment = findOverpaymentAtPixel(x)
      if (overpayment) {
        setDragState({ isDragging: true, overpaymentId: overpayment.id })
        setDragging(overpayment.id, true)
        event.preventDefault()
      }
    },
    [findOverpaymentAtPixel, setDragging]
  )

  // Handle mouse move for drag
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const chart = chartRef.current
      if (!chart) return

      const rect = chart.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left

      // Update cursor based on whether hovering over an overpayment line
      const chartArea = chart.chartArea
      if (x >= chartArea.left && x <= chartArea.right) {
        const overOp = findOverpaymentAtPixel(x)
        chart.canvas.style.cursor = overOp ? 'grab' : 'crosshair'
      } else {
        chart.canvas.style.cursor = 'default'
      }

      // Handle dragging
      if (dragState.isDragging && dragState.overpaymentId) {
        const newPeriodIndex = pixelToPeriodIndex(x)
        if (newPeriodIndex !== null) {
          updateOverpayment(dragState.overpaymentId, { periodIndex: newPeriodIndex })
        }
        chart.canvas.style.cursor = 'grabbing'
      }
    },
    [dragState, findOverpaymentAtPixel, pixelToPeriodIndex, updateOverpayment]
  )

  // Handle mouse up for drag end
  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging && dragState.overpaymentId) {
      setDragging(dragState.overpaymentId, false)
    }
    setDragState({ isDragging: false, overpaymentId: null })
  }, [dragState, setDragging])

  // Clear long press timer
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  // Handle touch start - long press to add, immediate drag if on existing line
  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      const chart = chartRef.current
      if (!chart) return

      const touch = event.touches[0]
      const rect = chart.canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left

      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY }

      // Check if touching an existing overpayment line
      const overpayment = findOverpaymentAtPixel(x)
      if (overpayment) {
        // Start dragging immediately
        setDragState({ isDragging: true, overpaymentId: overpayment.id })
        setDragging(overpayment.id, true)
        event.preventDefault()
        return
      }

      // Start long press timer for adding new overpayment
      clearLongPressTimer()
      longPressTimerRef.current = setTimeout(() => {
        const chartArea = chart.chartArea
        if (x >= chartArea.left && x <= chartArea.right) {
          const periodIndex = pixelToPeriodIndex(x)
          if (periodIndex !== null) {
            const date = periodIndexToDate(periodIndex, startDate)
            const dateLabel = formatDateLabel(date)

            const newOp: ChartOverpayment = {
              id: `temp-${Date.now()}`,
              periodIndex,
              amount: 0,
              dateLabel,
              isDragging: false,
            }

            setPendingOverpayment(newOp)
            setIsNewOverpayment(true)
            setPopoverAnchor(chart.canvas)

            // Vibrate on mobile if available (haptic feedback)
            if (navigator.vibrate) {
              navigator.vibrate(50)
            }
          }
        }
        longPressTimerRef.current = null
      }, 500) // 500ms long press
    },
    [
      findOverpaymentAtPixel,
      setDragging,
      clearLongPressTimer,
      pixelToPeriodIndex,
      startDate,
    ]
  )

  // Handle touch move - drag existing line or cancel long press
  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      const chart = chartRef.current
      if (!chart) return

      const touch = event.touches[0]
      const rect = chart.canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left

      // If moving significantly, cancel long press
      if (touchStartPosRef.current && longPressTimerRef.current) {
        const dx = Math.abs(touch.clientX - touchStartPosRef.current.x)
        const dy = Math.abs(touch.clientY - touchStartPosRef.current.y)
        if (dx > 10 || dy > 10) {
          clearLongPressTimer()
        }
      }

      // Handle dragging
      if (dragState.isDragging && dragState.overpaymentId) {
        event.preventDefault() // Prevent scrolling while dragging
        const newPeriodIndex = pixelToPeriodIndex(x)
        if (newPeriodIndex !== null) {
          updateOverpayment(dragState.overpaymentId, { periodIndex: newPeriodIndex })
        }
      }
    },
    [dragState, clearLongPressTimer, pixelToPeriodIndex, updateOverpayment]
  )

  // Handle touch end - end drag or clear timer
  const handleTouchEnd = useCallback(() => {
    clearLongPressTimer()
    touchStartPosRef.current = null

    if (dragState.isDragging && dragState.overpaymentId) {
      setDragging(dragState.overpaymentId, false)
    }
    setDragState({ isDragging: false, overpaymentId: null })
  }, [dragState, setDragging, clearLongPressTimer])

  // Handle popover amount change
  const handleAmountChange = useCallback((amount: number) => {
    setPendingOverpayment((prev) => (prev ? { ...prev, amount } : null))
  }, [])

  // Handle popover confirm
  const handlePopoverConfirm = useCallback(() => {
    if (!pendingOverpayment || pendingOverpayment.amount <= 0) return

    if (isNewOverpayment) {
      addOverpayment(pendingOverpayment.periodIndex, pendingOverpayment.amount)
    } else {
      updateOverpayment(pendingOverpayment.id, { amount: pendingOverpayment.amount })
    }

    setPopoverAnchor(null)
    setPendingOverpayment(null)
    setEditingId(null)
  }, [pendingOverpayment, isNewOverpayment, addOverpayment, updateOverpayment, setEditingId])

  // Handle popover delete
  const handlePopoverDelete = useCallback(() => {
    if (pendingOverpayment && !isNewOverpayment) {
      removeOverpayment(pendingOverpayment.id)
    }
    setPopoverAnchor(null)
    setPendingOverpayment(null)
    setEditingId(null)
  }, [pendingOverpayment, isNewOverpayment, removeOverpayment, setEditingId])

  // Handle popover close
  const handlePopoverClose = useCallback(() => {
    setPopoverAnchor(null)
    setPendingOverpayment(null)
    setEditingId(null)
  }, [setEditingId])

  // Chart data
  const data = useMemo(() => {
    const dates = years.map((y) => yearsToDate(y, startDate))

    return {
      labels: dates,
      datasets: [
        {
          label: 'Mortgage Balance',
          data: mortgageBalance,
          borderColor: chartColors.mortgageBalance,
          backgroundColor: `${chartColors.mortgageBalance}10`,
          fill: true,
          order: 2,
          tension: 0,
        },
        {
          label: 'Savings Balance',
          data: savingsBalance,
          borderColor: chartColors.savingsBalance,
          backgroundColor: `${chartColors.savingsBalance}10`,
          fill: true,
          order: 1,
          tension: 0,
        },
      ],
    }
  }, [years, mortgageBalance, savingsBalance, startDate])

  // Chart options with annotations
  const options: ChartOptions<'line'> = useMemo(() => {
    // Create annotations for all overpayments
    const annotations: Record<string, ReturnType<typeof createOverpaymentAnnotation>> = {}

    for (const op of chartOverpayments) {
      const date = periodIndexToDate(op.periodIndex, startDate)
      annotations[op.id] = createOverpaymentAnnotation(
        date,
        op.amount,
        op.id,
        op.id === editingId || op.isDragging
      )
    }

    // Add pending new overpayment annotation
    if (pendingOverpayment && isNewOverpayment) {
      const date = periodIndexToDate(pendingOverpayment.periodIndex, startDate)
      annotations['pending'] = createOverpaymentAnnotation(
        date,
        pendingOverpayment.amount || 0,
        'pending',
        true
      )
    }

    return {
      ...commonChartOptions,
      plugins: {
        ...commonChartOptions.plugins,
        annotation: {
          annotations,
        },
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
              const label = context.dataset.label || ''
              return `${label}: ${formatCurrency(context.parsed.y ?? 0)}`
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
      // Disable built-in click handler
      onClick: undefined,
    }
  }, [chartOverpayments, editingId, startDate, pendingOverpayment, isNewOverpayment, startingAge, years])

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%', height: '100%', touchAction: 'pan-y', WebkitTapHighlightColor: 'transparent' }}>
      {/* Instruction hint */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          position: 'absolute',
          top: 8,
          right: 16,
          zIndex: 1,
          backgroundColor: 'rgba(255,255,255,0.9)',
          px: 1,
          py: 0.5,
          borderRadius: 1,
        }}
      >
        {isTouchDevice ? 'Long-press to add overpayment' : 'Click to add overpayment'}
      </Typography>

      <Line
        ref={chartRef}
        data={data}
        options={options}
        onClick={handleChartClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      <OverpaymentPopover
        anchorEl={popoverAnchor}
        overpayment={pendingOverpayment}
        isNew={isNewOverpayment}
        onAmountChange={handleAmountChange}
        onConfirm={handlePopoverConfirm}
        onDelete={handlePopoverDelete}
        onClose={handlePopoverClose}
      />
    </Box>
  )
}
