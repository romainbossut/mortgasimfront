import { useRef, useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { MortgageApiService } from '../services/mortgageApi'
import type { SimulationRequest, SimulationResponse } from '../types/mortgage'

interface UseDebouncedSimulationOptions {
  debounceMs?: number
  onSuccess?: (data: SimulationResponse) => void
  onError?: (error: Error) => void
}

interface UseDebouncedSimulationReturn {
  debouncedMutate: (request: SimulationRequest) => void
  mutate: (request: SimulationRequest) => void
  cancelPending: () => void
  data: SimulationResponse | undefined
  error: Error | null
  isPending: boolean
  isDebouncing: boolean
}

export const useDebouncedSimulation = (
  options: UseDebouncedSimulationOptions = {}
): UseDebouncedSimulationReturn => {
  const { debounceMs = 500, onSuccess, onError } = options
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isDebouncing, setIsDebouncing] = useState(false)

  const mutation = useMutation({
    mutationFn: MortgageApiService.simulate,
    onSuccess: (data) => {
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(error as Error)
    },
  })

  const cancelPending = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      setIsDebouncing(false)
    }
  }, [])

  const debouncedMutate = useCallback(
    (request: SimulationRequest) => {
      // Cancel any pending debounced call
      cancelPending()

      setIsDebouncing(true)

      timeoutRef.current = setTimeout(() => {
        setIsDebouncing(false)
        mutation.mutate(request)
      }, debounceMs)
    },
    [mutation, debounceMs, cancelPending]
  )

  // Direct mutate without debouncing (for initial load, form submit)
  const mutate = useCallback(
    (request: SimulationRequest) => {
      cancelPending()
      mutation.mutate(request)
    },
    [mutation, cancelPending]
  )

  return {
    debouncedMutate,
    mutate,
    cancelPending,
    data: mutation.data,
    error: mutation.error as Error | null,
    isPending: mutation.isPending,
    isDebouncing,
  }
}
