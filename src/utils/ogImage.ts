export interface OGImageParams {
  loan: number;
  term: number;
  rate: number;
}

/**
 * Generate OG image URL for mortgage parameters
 * This would typically point to a backend API that generates images on-the-fly
 */
export function generateOGImageUrl(params: OGImageParams, baseUrl: string = ''): string {
  const searchParams = new URLSearchParams({
    loan: params.loan.toString(),
    term: params.term.toString(),
    rate: params.rate.toString(),
    format: 'png',
    width: '1200',
    height: '630',
  });

  return `${baseUrl}/api/og-image?${searchParams.toString()}`;
}

/**
 * Generate static OG image filename for pre-generated images
 */
export function generateStaticOGImagePath(params: OGImageParams): string {
  const { loan, term, rate } = params;
  const loanK = loan >= 1000 ? `${(loan / 1000).toFixed(0)}k` : loan.toString();
  const rateStr = rate.toString().replace('.', '_');
  
  return `/og-images/mortgage-${loanK}-${term}y-${rateStr}p.png`;
}

/**
 * Create a basic SVG-based OG image as data URL (for development/fallback)
 */
export function generateBasicOGImageDataUrl(params: OGImageParams): string {
  const { loan, term, rate } = params;
  const loanFormatted = `£${(loan / 1000).toFixed(0)}k`;
  const monthlyPayment = calculateEstimatedPayment(loan, term, rate);
  
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1976d2;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1565c0;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bg)"/>
      
      <!-- Logo/Brand area -->
      <rect x="50" y="50" width="200" height="60" rx="10" fill="rgba(255,255,255,0.1)"/>
      <text x="150" y="90" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">MortgaSim</text>
      
      <!-- Main content -->
      <text x="600" y="200" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold">${loanFormatted} Mortgage</text>
      <text x="600" y="260" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="Arial, sans-serif" font-size="32">${term} years at ${rate}% interest</text>
      
      <!-- Estimated payment -->
      <text x="600" y="340" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="24">Estimated monthly payment:</text>
      <text x="600" y="390" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="42" font-weight="bold">£${monthlyPayment.toLocaleString()}</text>
      
      <!-- CTA -->
      <rect x="450" y="460" width="300" height="60" rx="30" fill="rgba(255,255,255,0.9)"/>
      <text x="600" y="500" text-anchor="middle" fill="#1976d2" font-family="Arial, sans-serif" font-size="24" font-weight="bold">Calculate Full Scenario</text>
      
      <!-- Bottom info -->
      <text x="600" y="580" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="18">See total cost, savings growth, and net worth projections</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Simple mortgage payment calculation for display purposes
 */
function calculateEstimatedPayment(principal: number, years: number, annualRate: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }
  
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  return Math.round(monthlyPayment);
} 