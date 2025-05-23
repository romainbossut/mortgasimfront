// Types based on the OpenAPI specification for Mortgage Simulation API

export interface MortgageParameters {
  amount: number // Initial mortgage amount in pounds
  term_years: number // Mortgage term in years (max 40)
  fixed_rate: number // Fixed interest rate as percentage (0-15)
  fixed_term_months: number // Fixed rate term in months
  variable_rate?: number // Variable rate after fixed term (default 6.0)
  max_payment_after_fixed?: number | null // Maximum monthly payment after fixed period
}

export interface SavingsParameters {
  rate?: number // Annual savings interest rate as percentage (default 4.3)
  monthly_contribution?: number // Monthly savings contribution in pounds (default 2500.0)
  initial_balance?: number // Initial savings balance in pounds (default 170000.0)
}

export interface SimulationParameters {
  typical_payment?: number // Typical monthly payment (default 878.0)
  asset_value?: number // Property value in pounds (default 360000.0)
  show_years_after_payoff?: number // Years to show after mortgage is paid off (default 5)
  overpayments?: string | null // Overpayments in format 'month:amount,month:amount'
  start_date?: string // Start date for the simulation in YYYY-MM-DD format
}

export interface SimulationRequest {
  mortgage: MortgageParameters
  savings: SavingsParameters
  simulation?: SimulationParameters
}

export interface MonthlyData {
  month: number
  year: number
  principal_start: number
  principal_end: number
  monthly_payment: number
  overpayment: number
  total_payment: number
  interest_paid: number
  principal_repaid: number
  savings_balance_end: number
  savings_interest: number
  net_worth: number
  annual_mortgage_rate: number
  monthly_interest_rate: number
  annual_savings_rate: number
  monthly_savings_rate: number
  payment_difference: number
}

export interface ChartData {
  years: number[]
  mortgage_balance: number[]
  savings_balance: number[]
  net_worth: number[]
  monthly_payments: number[]
  interest_paid: number[]
  principal_paid: number[]
  monthly_savings_data: number[]
  interest_received: number[]
}

export interface SummaryStatistics {
  final_mortgage_balance: number
  final_savings_balance: number
  final_net_worth: number
  min_savings_balance: number
  min_savings_month: number
  mortgage_paid_off_month?: number | null
  fixed_term_end_balance?: number | null
}

export interface SimulationResponse {
  monthly_data: MonthlyData[]
  summary_statistics: SummaryStatistics
  chart_data: ChartData
  warnings: string[]
}

export interface HTTPValidationError {
  detail: Array<{
    loc: (string | number)[]
    msg: string
    type: string
  }>
} 