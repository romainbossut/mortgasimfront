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
  
  max_payment_after_fixed: z
    .union([z.number().positive('Maximum payment must be positive'), z.nan()])
    .optional()
    .transform((val) => val && !isNaN(val) ? val : undefined),

  // Savings parameters
  savings_rate: z
    .number()
    .min(0, 'Savings rate cannot be negative')
    .max(15, 'Savings rate cannot exceed 15%'),
  
  monthly_contribution: z
    .number()
    .min(0, 'Monthly contribution cannot be negative'),
  
  initial_balance: z
    .number()
    .min(0, 'Initial balance cannot be negative'),

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
      month: z.number().int('Month must be a whole number').min(1, 'Month must be at least 1'),
      amount: z.number().min(0, 'Amount cannot be negative'),
    }))
    .optional()
    .default([]),
})

// Helper type for custom overpayments
export type CustomOverpayment = {
  month: number
  amount: number
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
  mortgage_amount: 200000,
  term_years: 25,
  fixed_rate: 1.65,
  fixed_term_months: 24,
  variable_rate: 6.0,
  savings_rate: 4.3,
  monthly_contribution: 2500,
  initial_balance: 170000,
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
    
    // Convert custom overpayments to month:amount format
    const validOverpayments = data.custom_overpayments.filter(op => op.month > 0 && op.amount > 0)
    
    if (validOverpayments.length === 0) {
      return undefined
    }
    
    // Sort by month to ensure proper order
    validOverpayments.sort((a, b) => a.month - b.month)
    
    return validOverpayments
      .map(op => `${op.month}:${op.amount}`)
      .join(',')
  }
  
  return undefined
} 