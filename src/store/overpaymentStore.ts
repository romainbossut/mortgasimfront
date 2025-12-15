import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { periodIndexToDate } from '../utils/chartSetup'

export interface ChartOverpayment {
  id: string
  periodIndex: number // 1-based month from simulation start
  amount: number
  dateLabel: string // "Dec 2025" for display
  isDragging: boolean
}

interface OverpaymentStore {
  // State
  chartOverpayments: ChartOverpayment[]
  editingId: string | null
  startDate: string | null // Used for date calculations

  // Actions
  setStartDate: (date: string) => void
  addOverpayment: (periodIndex: number, amount: number) => void
  updateOverpayment: (id: string, updates: Partial<Omit<ChartOverpayment, 'id'>>) => void
  removeOverpayment: (id: string) => void
  setEditingId: (id: string | null) => void
  setDragging: (id: string, isDragging: boolean) => void
  clearAll: () => void

  // Computed helpers
  toApiString: () => string | null
  getOverpaymentAtPeriod: (periodIndex: number) => ChartOverpayment | undefined
}

// Helper to generate date label from period index
const generateDateLabel = (periodIndex: number, startDate: string): string => {
  const date = periodIndexToDate(periodIndex, startDate)
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

// Helper to generate unique ID
const generateId = (): string => {
  return `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const useOverpaymentStore = create<OverpaymentStore>()(
  persist(
    (set, get) => ({
      // Initial state
      chartOverpayments: [],
      editingId: null,
      startDate: null,

      // Actions
      setStartDate: (date: string) => {
        set({ startDate: date })
        // Recalculate all date labels when start date changes
        const { chartOverpayments } = get()
        if (chartOverpayments.length > 0) {
          set({
            chartOverpayments: chartOverpayments.map((op) => ({
              ...op,
              dateLabel: generateDateLabel(op.periodIndex, date),
            })),
          })
        }
      },

      addOverpayment: (periodIndex: number, amount: number) => {
        const { startDate, chartOverpayments } = get()
        if (!startDate) {
          console.warn('Cannot add overpayment: startDate not set')
          return
        }

        // Check if an overpayment already exists at this period
        const existing = chartOverpayments.find((op) => op.periodIndex === periodIndex)
        if (existing) {
          // Update existing instead of adding new
          set({
            chartOverpayments: chartOverpayments.map((op) =>
              op.id === existing.id ? { ...op, amount } : op
            ),
            editingId: existing.id,
          })
          return
        }

        const newOverpayment: ChartOverpayment = {
          id: generateId(),
          periodIndex,
          amount,
          dateLabel: generateDateLabel(periodIndex, startDate),
          isDragging: false,
        }

        set({
          chartOverpayments: [...chartOverpayments, newOverpayment].sort(
            (a, b) => a.periodIndex - b.periodIndex
          ),
          editingId: newOverpayment.id,
        })
      },

      updateOverpayment: (id: string, updates: Partial<Omit<ChartOverpayment, 'id'>>) => {
        const { chartOverpayments, startDate } = get()

        set({
          chartOverpayments: chartOverpayments
            .map((op) => {
              if (op.id !== id) return op

              const updated = { ...op, ...updates }

              // Recalculate date label if period changed
              if (updates.periodIndex !== undefined && startDate) {
                updated.dateLabel = generateDateLabel(updates.periodIndex, startDate)
              }

              return updated
            })
            .sort((a, b) => a.periodIndex - b.periodIndex),
        })
      },

      removeOverpayment: (id: string) => {
        const { chartOverpayments, editingId } = get()
        set({
          chartOverpayments: chartOverpayments.filter((op) => op.id !== id),
          editingId: editingId === id ? null : editingId,
        })
      },

      setEditingId: (id: string | null) => {
        set({ editingId: id })
      },

      setDragging: (id: string, isDragging: boolean) => {
        const { chartOverpayments } = get()
        set({
          chartOverpayments: chartOverpayments.map((op) =>
            op.id === id ? { ...op, isDragging } : op
          ),
        })
      },

      clearAll: () => {
        set({ chartOverpayments: [], editingId: null })
      },

      // Convert to API format: "month:amount,month:amount"
      toApiString: () => {
        const { chartOverpayments } = get()
        if (chartOverpayments.length === 0) return null

        return chartOverpayments
          .filter((op) => op.amount > 0)
          .map((op) => `${op.periodIndex}:${op.amount}`)
          .join(',')
      },

      getOverpaymentAtPeriod: (periodIndex: number) => {
        const { chartOverpayments } = get()
        return chartOverpayments.find((op) => op.periodIndex === periodIndex)
      },
    }),
    {
      name: 'mortgasim-overpayments',
      partialize: (state) => ({
        chartOverpayments: state.chartOverpayments.map((op) => ({
          ...op,
          isDragging: false, // Don't persist dragging state
        })),
        startDate: state.startDate,
      }),
    }
  )
)
