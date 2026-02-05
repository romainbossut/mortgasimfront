import { z } from 'zod'

// Zod schema for mortgage form validation
export const mortgageFormSchema = z.object({
  // Start date for the simulation
  start_date: z
    .string()
    .min(1, 'Start date is required')
    .refine((date) => {
      const parsedDate = new Date(date)
      return !isNaN(parsedDate.getTime())
    }, 'Please enter a valid date'),

  // Optional birth year for age display on charts
  birth_year: z
    .union([z.number().int().min(1900).max(2020), z.nan()])
    .optional()
    .transform((val) => (val && !isNaN(val) ? val : undefined)),

  // Mortgage parameters
  mortgage_amount: z
    .number()
    .positive('Mortgage amount must be positive')
    .min(1000, 'Mortgage amount must be at least £1,000'),
  
  term_years: z
    .number()
    .positive('Term must be positive')
    .max(40, 'Term cannot exceed 40 years')
    .min(1, 'Term must be at least 1 year'),
  
  fixed_rate: z
    .number()
    .min(0, 'Fixed rate cannot be negative')
    .max(15, 'Fixed rate cannot exceed 15%'),
  
  fixed_term_months: z
    .number()
    .int('Fixed term must be a whole number of months')
    .min(0, 'Fixed term cannot be negative'),
  
  variable_rate: z
    .number()
    .min(0, 'Variable rate cannot be negative')
    .max(15, 'Variable rate cannot exceed 15%'),

  // Deals - array of fixed-rate deal periods
  deals: z
    .array(z.object({
      start_month: z.number().int().min(0, 'Start month cannot be negative'),
      end_month: z.number().int().min(1, 'End month must be at least 1'),
      rate: z.number().min(0, 'Rate cannot be negative').max(15, 'Rate cannot exceed 15%'),
    }))
    .optional()
    .default([{ start_month: 0, end_month: 24, rate: 1.65 }]),

  // Savings accounts - array of accounts with name, rate, contribution, initial_balance
  savings_accounts: z
    .array(z.object({
      name: z.string().min(1, 'Account name is required').max(50, 'Account name too long'),
      rate: z.number().min(0, 'Rate cannot be negative').max(15, 'Rate cannot exceed 15%'),
      monthly_contribution: z.number().min(0, 'Contribution cannot be negative'),
      initial_balance: z.number().min(0, 'Initial balance cannot be negative'),
    }))
    .min(0, 'At least one account can be added')
    .max(10, 'Maximum 10 accounts allowed')
    .default([{
      name: 'Savings',
      rate: 4.3,
      monthly_contribution: 2500,
      initial_balance: 170000
    }]),

  // Simulation parameters
  typical_payment: z
    .number()
    .min(0, 'Typical payment cannot be negative'),
  
  asset_value: z
    .number()
    .min(0, 'Asset value cannot be negative'),
  
  show_years_after_payoff: z
    .number()
    .int('Years after payoff must be a whole number')
    .min(0, 'Years after payoff cannot be negative')
    .max(20, 'Years after payoff cannot exceed 20'),
  
  // Overpayments - new user-friendly structure
  overpayment_type: z
    .enum(['none', 'regular', 'custom'])
    .default('none'),
  
  regular_overpayment_amount: z
    .number()
    .min(0, 'Overpayment amount cannot be negative')
    .optional(),
  
  regular_overpayment_months: z
    .number()
    .int('Duration must be a whole number of months')
    .min(1, 'Duration must be at least 1 month')
    .max(300, 'Duration cannot exceed 300 months')
    .optional(),
  
  custom_overpayments: z
    .array(z.object({
      month: z.number().int('Month must be a whole number').min(1, 'Month must be between 1-12').max(12, 'Month must be between 1-12'),
      year: z.number().int('Year must be a whole number').min(2020, 'Year must be at least 2020'),
      amount: z.number().min(0, 'Amount cannot be negative'),
    }))
    .optional()
    .default([]),
})

// Helper type for custom overpayments
export type CustomOverpayment = {
  month: number // Calendar month (1-12)
  year: number
  amount: number
}

// Helper type for savings accounts
export type SavingsAccountFormData = {
  name: string
  rate: number
  monthly_contribution: number
  initial_balance: number
}

export type MortgageFormData = z.infer<typeof mortgageFormSchema>

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Default form values
export const defaultFormValues: MortgageFormData = {
  start_date: getTodayDate(),
  birth_year: undefined,
  mortgage_amount: 200000,
  term_years: 25,
  fixed_rate: 1.65,
  fixed_term_months: 24,
  variable_rate: 6.0,
  deals: [{ start_month: 0, end_month: 24, rate: 1.65 }],
  savings_accounts: [{
    name: 'Savings',
    rate: 4.3,
    monthly_contribution: 2500,
    initial_balance: 170000
  }],
  typical_payment: 878,
  asset_value: 360000,
  show_years_after_payoff: 5,
  overpayment_type: 'none',
  custom_overpayments: [],
}

// Helper function to convert new overpayment structure to API format
export const convertOverpaymentsToApiFormat = (data: MortgageFormData): string | undefined => {
  if (data.overpayment_type === 'none') {
    return undefined
  }
  
  if (data.overpayment_type === 'regular') {
    if (!data.regular_overpayment_amount || !data.regular_overpayment_months) {
      return undefined
    }
    
    // Convert regular overpayments to month:amount format
    const overpayments: string[] = []
    for (let i = 1; i <= data.regular_overpayment_months; i++) {
      overpayments.push(`${i}:${data.regular_overpayment_amount}`)
    }
    return overpayments.join(',')
  }
  
  if (data.overpayment_type === 'custom') {
    if (!data.custom_overpayments || data.custom_overpayments.length === 0) {
      return undefined
    }
    
    // Convert custom overpayments to month:amount format using period index
    const validOverpayments = data.custom_overpayments.filter(op => 
      op.month >= 1 && op.month <= 12 && op.year >= 2020 && op.amount > 0
    )
    
    if (validOverpayments.length === 0) {
      return undefined
    }
    
    // Convert month/year to period index and sort by period
    const convertedOverpayments = validOverpayments.map(op => ({
      periodIndex: monthYearToPeriodIndex(op.month, op.year, data.start_date),
      amount: op.amount
    }))
    
    // Sort by period index
    convertedOverpayments.sort((a, b) => a.periodIndex - b.periodIndex)
    
    return convertedOverpayments
      .map(op => `${op.periodIndex}:${op.amount}`)
      .join(',')
  }
  
  return undefined
}

// Helper function to convert month/year to period index based on start date
export const monthYearToPeriodIndex = (month: number, year: number, startDate: string): number => {
  const start = new Date(startDate)
  const target = new Date(year, month - 1) // month - 1 because Date uses 0-based months
  
  // Calculate the difference in months
  const startYear = start.getFullYear()
  const startMonth = start.getMonth()
  const targetYear = target.getFullYear()
  const targetMonth = target.getMonth()
  
  const periodIndex = (targetYear - startYear) * 12 + (targetMonth - startMonth) + 1
  
  return Math.max(1, periodIndex) // Ensure minimum of 1
}

// Helper function to get month name
export const getMonthName = (monthNumber: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[monthNumber - 1] || 'Invalid'
}

// Local storage utilities with validation
const STORAGE_KEY = 'mortgasim_form_data'
const STORAGE_VERSION = '3.0.0' // Updated for multi-deal + multi-account support

interface StoredFormData {
  version: string
  timestamp: number
  data: MortgageFormData
}

// Validate stored data against current schema
export const validateStoredData = (stored: any): stored is StoredFormData => {
  try {
    // Check if it has the expected structure
    if (!stored || typeof stored !== 'object') return false
    if (!stored.version || !stored.timestamp || !stored.data) return false
    
    // Check version compatibility
    if (stored.version !== STORAGE_VERSION) return false
    
    // Check if data is not too old (30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    if (stored.timestamp < thirtyDaysAgo) return false
    
    // Validate against schema
    const result = mortgageFormSchema.safeParse(stored.data)
    return result.success
  } catch (error) {
    console.warn('Failed to validate stored data:', error)
    return false
  }
}

// Save form data to localStorage
export const saveFormDataToStorage = (data: MortgageFormData): void => {
  try {
    const storedData: StoredFormData = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      data
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData))
  } catch (error) {
    console.warn('Failed to save form data to localStorage:', error)
  }
}

// Load form data from localStorage
export const loadFormDataFromStorage = (): MortgageFormData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    
    const parsedData = JSON.parse(stored)
    
    if (validateStoredData(parsedData)) {
      return parsedData.data
    } else {
      // Invalid format - clear the storage
      console.warn('Stored form data is invalid or outdated, clearing localStorage')
      clearFormDataFromStorage()
      return null
    }
  } catch (error) {
    console.warn('Failed to load form data from localStorage:', error)
    clearFormDataFromStorage()
    return null
  }
}

// Clear form data from localStorage
export const clearFormDataFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear form data from localStorage:', error)
  }
} 