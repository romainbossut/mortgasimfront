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
  
  overpayments: z
    .string()
    .regex(
      /^(\d+:\d+(\.\d+)?(,\d+:\d+(\.\d+)?)*)?$/,
      'Overpayments format should be "month:amount,month:amount" (e.g., "18:20000,19:10000")'
    )
    .optional()
    .or(z.literal('')),
})

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
} 