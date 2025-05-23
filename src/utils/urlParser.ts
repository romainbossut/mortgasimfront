export interface MortgageParams {
  loan: number;
  term: number;
  rate: number;
}

// Import the complete form data type
import type { MortgageFormData, CustomOverpayment } from './validation'

/**
 * Parse mortgage parameters from URL slug
 * Format: {amount}k-over-{term}-years-at-{rate}-percent
 * Example: 300k-over-25-years-at-4-percent
 */
export function parseMortgageSlug(slug: string): MortgageParams | null {
  try {
    // Remove any leading/trailing slashes and normalize
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '').toLowerCase();
    
    // Updated regex to handle decimal rates (e.g., 4.5-percent)
    const regex = /^(\d+(?:\.\d+)?)k?-over-(\d+)-years?-at-(\d+(?:\.\d+)?)-percent$/;
    const match = cleanSlug.match(regex);
    
    if (!match) {
      return null;
    }

    const [, loanStr, termStr, rateStr] = match;
    
    const loan = parseFloat(loanStr) * (cleanSlug.includes('k') ? 1000 : 1);
    const term = parseInt(termStr, 10);
    const rate = parseFloat(rateStr);

    // Validate ranges
    if (loan < 1000 || loan > 10000000) return null;
    if (term < 1 || term > 40) return null;
    if (rate < 0 || rate > 15) return null;

    return { loan, term, rate };
  } catch {
    return null;
  }
}

/**
 * Generate URL slug from mortgage parameters
 */
export function generateMortgageSlug(loan: number, term: number, rate: number): string {
  // Convert loan to 'k' format if >= 1000
  const loanDisplay = loan >= 1000 
    ? `${(loan / 1000).toString().replace(/\.0$/, '')}k`
    : loan.toString();
  
  // Format rate to remove unnecessary decimals
  const rateDisplay = rate.toString().replace(/\.0$/, '');
  
  return `${loanDisplay}-over-${term}-years-at-${rateDisplay}-percent`;
}

/**
 * Parse query string parameters as fallback
 */
export function parseMortgageQuery(searchParams: URLSearchParams): Partial<MortgageParams> {
  const params: Partial<MortgageParams> = {};
  
  const loan = searchParams.get('loan');
  if (loan) {
    const loanNum = parseFloat(loan);
    if (!isNaN(loanNum) && loanNum >= 1000 && loanNum <= 10000000) {
      params.loan = loanNum;
    }
  }
  
  const term = searchParams.get('term');
  if (term) {
    const termNum = parseInt(term, 10);
    if (!isNaN(termNum) && termNum >= 1 && termNum <= 40) {
      params.term = termNum;
    }
  }
  
  const rate = searchParams.get('rate');
  if (rate) {
    const rateNum = parseFloat(rate);
    if (!isNaN(rateNum) && rateNum >= 0 && rateNum <= 15) {
      params.rate = rateNum;
    }
  }
  
  return params;
}

/**
 * Encode complete form data into URL parameters
 */
export function encodeFormDataToUrl(data: MortgageFormData): string {
  const params = new URLSearchParams();
  
  // Basic mortgage parameters
  params.set('start_date', data.start_date);
  params.set('mortgage_amount', data.mortgage_amount.toString());
  params.set('term_years', data.term_years.toString());
  params.set('fixed_rate', data.fixed_rate.toString());
  params.set('fixed_term_months', data.fixed_term_months.toString());
  params.set('variable_rate', data.variable_rate.toString());
  
  // Optional max payment
  if (data.max_payment_after_fixed) {
    params.set('max_payment_after_fixed', data.max_payment_after_fixed.toString());
  }
  
  // Savings parameters
  params.set('savings_rate', data.savings_rate.toString());
  params.set('monthly_contribution', data.monthly_contribution.toString());
  params.set('initial_balance', data.initial_balance.toString());
  
  // Simulation parameters
  params.set('typical_payment', data.typical_payment.toString());
  params.set('asset_value', data.asset_value.toString());
  params.set('show_years_after_payoff', data.show_years_after_payoff.toString());
  
  // Overpayments
  params.set('overpayment_type', data.overpayment_type);
  
  if (data.overpayment_type === 'regular') {
    if (data.regular_overpayment_amount) {
      params.set('regular_overpayment_amount', data.regular_overpayment_amount.toString());
    }
    if (data.regular_overpayment_months) {
      params.set('regular_overpayment_months', data.regular_overpayment_months.toString());
    }
  } else if (data.overpayment_type === 'custom' && data.custom_overpayments?.length) {
    // Encode custom overpayments as a compact format: month1-year1-amount1,month2-year2-amount2
    const customOverpaymentsStr = data.custom_overpayments
      .filter(op => op.amount > 0)
      .map(op => `${op.month}-${op.year}-${op.amount}`)
      .join(',');
    if (customOverpaymentsStr) {
      params.set('custom_overpayments', customOverpaymentsStr);
    }
  }
  
  // Generate the full URL
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Decode complete form data from URL parameters
 */
export function decodeFormDataFromUrl(searchParams: URLSearchParams): Partial<MortgageFormData> {
  const data: Partial<MortgageFormData> = {};
  
  // Helper function to parse number with validation
  const parseNumber = (value: string | null, min?: number, max?: number): number | undefined => {
    if (!value) return undefined;
    const num = parseFloat(value);
    if (isNaN(num)) return undefined;
    if (min !== undefined && num < min) return undefined;
    if (max !== undefined && num > max) return undefined;
    return num;
  };
  
  // Helper function to parse integer with validation
  const parseInteger = (value: string | null, min?: number, max?: number): number | undefined => {
    if (!value) return undefined;
    const num = Number.parseInt(value, 10);
    if (isNaN(num)) return undefined;
    if (min !== undefined && num < min) return undefined;
    if (max !== undefined && num > max) return undefined;
    return num;
  };
  
  // Parse all form fields with validation
  const startDate = searchParams.get('start_date');
  if (startDate && !isNaN(new Date(startDate).getTime())) {
    data.start_date = startDate;
  }
  
  data.mortgage_amount = parseNumber(searchParams.get('mortgage_amount'), 1000, 10000000);
  data.term_years = parseInteger(searchParams.get('term_years'), 1, 40);
  data.fixed_rate = parseNumber(searchParams.get('fixed_rate'), 0, 15);
  data.fixed_term_months = parseInteger(searchParams.get('fixed_term_months'), 0);
  data.variable_rate = parseNumber(searchParams.get('variable_rate'), 0, 15);
  data.max_payment_after_fixed = parseNumber(searchParams.get('max_payment_after_fixed'), 0);
  
  data.savings_rate = parseNumber(searchParams.get('savings_rate'), 0, 15);
  data.monthly_contribution = parseNumber(searchParams.get('monthly_contribution'), 0);
  data.initial_balance = parseNumber(searchParams.get('initial_balance'), 0);
  
  data.typical_payment = parseNumber(searchParams.get('typical_payment'), 0);
  data.asset_value = parseNumber(searchParams.get('asset_value'), 0);
  data.show_years_after_payoff = parseInteger(searchParams.get('show_years_after_payoff'), 0, 20);
  
  // Parse overpayments
  const overpaymentType = searchParams.get('overpayment_type');
  if (overpaymentType && ['none', 'regular', 'custom'].includes(overpaymentType)) {
    data.overpayment_type = overpaymentType as 'none' | 'regular' | 'custom';
    
    if (overpaymentType === 'regular') {
      data.regular_overpayment_amount = parseNumber(searchParams.get('regular_overpayment_amount'), 0);
      data.regular_overpayment_months = parseInteger(searchParams.get('regular_overpayment_months'), 1, 300);
    } else if (overpaymentType === 'custom') {
      const customOverpaymentsStr = searchParams.get('custom_overpayments');
      if (customOverpaymentsStr) {
        try {
          const customOverpayments: CustomOverpayment[] = customOverpaymentsStr
            .split(',')
            .map(item => {
              const [monthStr, yearStr, amountStr] = item.split('-');
              const month = parseInt(monthStr, 10);
              const year = parseInt(yearStr, 10);
              const amount = parseFloat(amountStr);
              
              if (isNaN(month) || isNaN(year) || isNaN(amount)) return null;
              if (month < 1 || month > 12) return null;
              if (year < 2020) return null;
              if (amount < 0) return null;
              
              return { month, year, amount };
            })
            .filter((item): item is CustomOverpayment => item !== null);
          
          if (customOverpayments.length > 0) {
            data.custom_overpayments = customOverpayments;
          }
        } catch (error) {
          console.warn('Failed to parse custom overpayments from URL:', error);
        }
      }
    }
  }
  
  // Filter out undefined values
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as Partial<MortgageFormData>;
}

/**
 * Generate a shareable link for the current form data
 */
export function generateShareableLink(data: MortgageFormData): string {
  return encodeFormDataToUrl(data);
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (error) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
} 