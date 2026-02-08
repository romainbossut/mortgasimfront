import axios from 'axios'
import type { SimulationRequest, SimulationResponse, HTTPValidationError } from '../types/mortgage'
import type { MortgageFormData } from '../utils/validation'
import { convertOverpaymentsToApiFormat } from '../utils/validation'

// Environment-based API URL configuration
const getApiBaseUrl = (): string => {
  const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_ENV === 'development'
  
  if (isDevelopment) {
    return 'http://127.0.0.1:8000'
  }
  
  return 'https://api.mortgasim.com'
}

const API_BASE_URL = getApiBaseUrl()

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// API response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 422) {
      const validationError: HTTPValidationError = error.response.data
      throw new Error(
        `Validation Error: ${validationError.detail
          .map(detail => `${detail.loc.join('.')}: ${detail.msg}`)
          .join(', ')}`
      )
    }
    throw error
  }
)

export class MortgageApiService {
  /**
   * Health check endpoint
   */
  static async healthCheck(): Promise<{ message: string; status: string; timestamp: string }> {
    const response = await api.get('/')
    return response.data
  }

  /**
   * Run a mortgage simulation
   */
  static async simulate(request: SimulationRequest): Promise<SimulationResponse> {
    const response = await api.post<SimulationResponse>('/simulate', request)
    return response.data
  }

  /**
   * Export simulation results as CSV
   */
  static async exportCsv(request: SimulationRequest): Promise<Blob> {
    const response = await api.post('/simulate/csv', request, {
      responseType: 'blob',
    })
    return response.data
  }

  /**
   * Get a sample simulation request
   */
  static async getSampleRequest(): Promise<SimulationRequest> {
    const response = await api.get<SimulationRequest>('/simulate/sample')
    return response.data
  }

  /**
   * Create an overpayment schedule
   */
  static async createOverpaymentSchedule(params: {
    term_months: number
    schedule_type: 'none' | 'fixed' | 'lump_sum' | 'yearly_bonus' | 'custom'
    monthly_amount?: number
    bonus_month?: number
    bonus_amount?: number
    lump_sums?: string
  }): Promise<string> {
    const queryParams = new URLSearchParams()
    
    queryParams.append('term_months', params.term_months.toString())
    queryParams.append('schedule_type', params.schedule_type)
    
    if (params.monthly_amount !== undefined) {
      queryParams.append('monthly_amount', params.monthly_amount.toString())
    }
    if (params.bonus_month !== undefined) {
      queryParams.append('bonus_month', params.bonus_month.toString())
    }
    if (params.bonus_amount !== undefined) {
      queryParams.append('bonus_amount', params.bonus_amount.toString())
    }
    if (params.lump_sums) {
      queryParams.append('lump_sums', params.lump_sums)
    }

    const response = await api.get(`/overpayment-schedule/create?${queryParams}`)
    return response.data
  }
}

// Helper function to transform form data to API request format
export const transformFormDataToRequest = (formData: MortgageFormData): SimulationRequest => {
  // Build deals array for API
  const deals = formData.deals && formData.deals.length > 0
    ? formData.deals.map(d => ({
        start_month: d.start_month,
        end_month: d.end_month,
        rate: d.rate,
      }))
    : undefined

  // Derive legacy fixed_rate/fixed_term_months from first deal for backward compat
  const firstDeal = deals && deals.length > 0 ? deals[0] : null

  return {
    mortgage: {
      amount: formData.mortgage_amount,
      term_years: formData.term_years,
      fixed_rate: firstDeal ? firstDeal.rate : formData.fixed_rate,
      fixed_term_months: firstDeal ? firstDeal.end_month : formData.fixed_term_months,
      variable_rate: formData.variable_rate,
      deals,
    },
    savings: {
      accounts: formData.savings_accounts.map(acc => ({
        name: acc.name,
        rate: acc.rate,
        monthly_contribution: acc.monthly_contribution,
        initial_balance: acc.initial_balance,
        draw_for_repayment: acc.draw_for_repayment,
      })),
    },
    simulation: {
      typical_payment: formData.typical_payment,
      asset_value: formData.asset_value,
      show_years_after_payoff: formData.show_years_after_payoff,
      overpayments: convertOverpaymentsToApiFormat(formData) || null,
      start_date: formData.start_date,
    },
  }
}

export default MortgageApiService 