// Types based on the OpenAPI specification for Mortgage Simulation API

export interface Deal {
  start_month: number // 0-based, inclusive
  end_month: number // 0-based, exclusive
  rate: number // annual rate %
}

export interface MortgageParameters {
  amount: number // Initial mortgage amount in pounds
  term_years: number // Mortgage term in years (max 40)
  fixed_rate: number // Fixed interest rate as percentage (legacy, use deals)
  fixed_term_months: number // Fixed rate term in months (legacy, use deals)
  variable_rate?: number // Variable rate / SVR after fixed term (default 6.0)
  deals?: Deal[] // List of fixed-rate deal periods
}

// Individual savings/investment account
export interface SavingsAccount {
  name: string // Account name (e.g., 'ISA', 'SIPP')
  rate: number // Annual interest rate as percentage
  monthly_contribution: number // Monthly contribution in pounds
  initial_balance: number // Initial balance in pounds
}

export interface SavingsParameters {
  accounts?: SavingsAccount[] // List of savings/investment accounts
  // Legacy single-account fields (deprecated, use accounts instead)
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

// Per-account chart data
export interface AccountChartData {
  name: string // Account name
  balance: number[] // Account balance over time
  interest_received: number[] // Interest received per month
  contributions: number[] // Contributions per month
}

export interface ChartData {
  years: number[]
  mortgage_balance: number[]
  savings_balance: number[] // Consolidated savings balance
  net_worth: number[]
  monthly_payments: number[]
  interest_paid: number[]
  principal_paid: number[]
  monthly_savings_data: number[] // Consolidated monthly contributions
  interest_received: number[] // Consolidated interest received
  accounts: AccountChartData[] // Per-account chart data
}

// Per-account summary statistics
export interface AccountSummary {
  name: string // Account name
  final_balance: number // Final balance for this account
  total_contributions: number // Total contributions made
  total_interest_earned: number // Total interest earned
}

export interface SummaryStatistics {
  final_mortgage_balance: number
  final_savings_balance: number // Consolidated final savings
  final_net_worth: number
  min_savings_balance: number // Consolidated minimum
  min_savings_month: number
  mortgage_paid_off_month?: number | null
  fixed_term_end_balance?: number | null
  account_summaries: AccountSummary[] // Per-account summaries
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