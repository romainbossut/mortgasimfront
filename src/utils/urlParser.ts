export interface MortgageParams {
  loan: number;
  term: number;
  rate: number;
}

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