export interface MortgageCombination {
  loan: number;
  term: number;
  rate: number;
  priority: 'high' | 'medium' | 'low';
}

export const mortgageCombinations: MortgageCombination[] = [
  // High priority - most common loan amounts and terms
  // £200k-£500k loans
  { loan: 200000, term: 25, rate: 4.0, priority: 'high' },
  { loan: 200000, term: 25, rate: 5.0, priority: 'high' },
  { loan: 200000, term: 30, rate: 4.0, priority: 'high' },
  { loan: 200000, term: 30, rate: 5.0, priority: 'high' },
  
  { loan: 250000, term: 25, rate: 4.0, priority: 'high' },
  { loan: 250000, term: 25, rate: 5.0, priority: 'high' },
  { loan: 250000, term: 30, rate: 4.0, priority: 'high' },
  { loan: 250000, term: 30, rate: 5.0, priority: 'high' },
  
  { loan: 300000, term: 25, rate: 4.0, priority: 'high' },
  { loan: 300000, term: 25, rate: 5.0, priority: 'high' },
  { loan: 300000, term: 30, rate: 4.0, priority: 'high' },
  { loan: 300000, term: 30, rate: 5.0, priority: 'high' },
  
  { loan: 350000, term: 25, rate: 4.0, priority: 'high' },
  { loan: 350000, term: 25, rate: 5.0, priority: 'high' },
  { loan: 350000, term: 30, rate: 4.0, priority: 'high' },
  { loan: 350000, term: 30, rate: 5.0, priority: 'high' },
  
  { loan: 400000, term: 25, rate: 4.0, priority: 'high' },
  { loan: 400000, term: 25, rate: 5.0, priority: 'high' },
  { loan: 400000, term: 30, rate: 4.0, priority: 'high' },
  { loan: 400000, term: 30, rate: 5.0, priority: 'high' },
  
  { loan: 450000, term: 25, rate: 4.0, priority: 'high' },
  { loan: 450000, term: 25, rate: 5.0, priority: 'high' },
  { loan: 450000, term: 30, rate: 4.0, priority: 'high' },
  { loan: 450000, term: 30, rate: 5.0, priority: 'high' },
  
  { loan: 500000, term: 25, rate: 4.0, priority: 'high' },
  { loan: 500000, term: 25, rate: 5.0, priority: 'high' },
  { loan: 500000, term: 30, rate: 4.0, priority: 'high' },
  { loan: 500000, term: 30, rate: 5.0, priority: 'high' },

  // Medium priority - other common rates and terms
  { loan: 200000, term: 20, rate: 4.0, priority: 'medium' },
  { loan: 200000, term: 20, rate: 5.0, priority: 'medium' },
  { loan: 200000, term: 35, rate: 4.0, priority: 'medium' },
  { loan: 200000, term: 35, rate: 5.0, priority: 'medium' },
  
  { loan: 250000, term: 20, rate: 4.0, priority: 'medium' },
  { loan: 250000, term: 20, rate: 5.0, priority: 'medium' },
  { loan: 250000, term: 35, rate: 4.0, priority: 'medium' },
  { loan: 250000, term: 35, rate: 5.0, priority: 'medium' },
  
  { loan: 300000, term: 20, rate: 4.0, priority: 'medium' },
  { loan: 300000, term: 20, rate: 5.0, priority: 'medium' },
  { loan: 300000, term: 35, rate: 4.0, priority: 'medium' },
  { loan: 300000, term: 35, rate: 5.0, priority: 'medium' },
  
  { loan: 350000, term: 20, rate: 4.0, priority: 'medium' },
  { loan: 350000, term: 20, rate: 5.0, priority: 'medium' },
  { loan: 350000, term: 35, rate: 4.0, priority: 'medium' },
  { loan: 350000, term: 35, rate: 5.0, priority: 'medium' },
  
  { loan: 400000, term: 20, rate: 4.0, priority: 'medium' },
  { loan: 400000, term: 20, rate: 5.0, priority: 'medium' },
  { loan: 400000, term: 35, rate: 4.0, priority: 'medium' },
  { loan: 400000, term: 35, rate: 5.0, priority: 'medium' },
  
  { loan: 450000, term: 20, rate: 4.0, priority: 'medium' },
  { loan: 450000, term: 20, rate: 5.0, priority: 'medium' },
  { loan: 450000, term: 35, rate: 4.0, priority: 'medium' },
  { loan: 450000, term: 35, rate: 5.0, priority: 'medium' },
  
  { loan: 500000, term: 20, rate: 4.0, priority: 'medium' },
  { loan: 500000, term: 20, rate: 5.0, priority: 'medium' },
  { loan: 500000, term: 35, rate: 4.0, priority: 'medium' },
  { loan: 500000, term: 35, rate: 5.0, priority: 'medium' },

  // Additional rates for high priority loans
  { loan: 300000, term: 25, rate: 3.5, priority: 'medium' },
  { loan: 300000, term: 25, rate: 4.5, priority: 'medium' },
  { loan: 300000, term: 25, rate: 5.5, priority: 'medium' },
  { loan: 300000, term: 25, rate: 6.0, priority: 'medium' },
  
  // Lower priority - less common amounts and edge cases
  { loan: 150000, term: 25, rate: 4.0, priority: 'low' },
  { loan: 150000, term: 25, rate: 5.0, priority: 'low' },
  { loan: 150000, term: 30, rate: 4.0, priority: 'low' },
  { loan: 150000, term: 30, rate: 5.0, priority: 'low' },
  
  { loan: 175000, term: 25, rate: 4.0, priority: 'low' },
  { loan: 175000, term: 25, rate: 5.0, priority: 'low' },
  { loan: 175000, term: 30, rate: 4.0, priority: 'low' },
  { loan: 175000, term: 30, rate: 5.0, priority: 'low' },
  
  { loan: 550000, term: 25, rate: 4.0, priority: 'low' },
  { loan: 550000, term: 25, rate: 5.0, priority: 'low' },
  { loan: 550000, term: 30, rate: 4.0, priority: 'low' },
  { loan: 550000, term: 30, rate: 5.0, priority: 'low' },
  
  { loan: 600000, term: 25, rate: 4.0, priority: 'low' },
  { loan: 600000, term: 25, rate: 5.0, priority: 'low' },
  { loan: 600000, term: 30, rate: 4.0, priority: 'low' },
  { loan: 600000, term: 30, rate: 5.0, priority: 'low' },
  
  { loan: 650000, term: 25, rate: 4.0, priority: 'low' },
  { loan: 650000, term: 25, rate: 5.0, priority: 'low' },
  { loan: 650000, term: 30, rate: 4.0, priority: 'low' },
  { loan: 650000, term: 30, rate: 5.0, priority: 'low' },
  
  { loan: 700000, term: 25, rate: 4.0, priority: 'low' },
  { loan: 700000, term: 25, rate: 5.0, priority: 'low' },
  { loan: 700000, term: 30, rate: 4.0, priority: 'low' },
  { loan: 700000, term: 30, rate: 5.0, priority: 'low' },

  // Different rate variations
  { loan: 200000, term: 25, rate: 3.0, priority: 'low' },
  { loan: 200000, term: 25, rate: 3.5, priority: 'low' },
  { loan: 200000, term: 25, rate: 4.5, priority: 'low' },
  { loan: 200000, term: 25, rate: 5.5, priority: 'low' },
  { loan: 200000, term: 25, rate: 6.0, priority: 'low' },
  { loan: 200000, term: 25, rate: 6.5, priority: 'low' },
  
  { loan: 250000, term: 25, rate: 3.0, priority: 'low' },
  { loan: 250000, term: 25, rate: 3.5, priority: 'low' },
  { loan: 250000, term: 25, rate: 4.5, priority: 'low' },
  { loan: 250000, term: 25, rate: 5.5, priority: 'low' },
  { loan: 250000, term: 25, rate: 6.0, priority: 'low' },
  { loan: 250000, term: 25, rate: 6.5, priority: 'low' },
  
  { loan: 350000, term: 25, rate: 3.0, priority: 'low' },
  { loan: 350000, term: 25, rate: 3.5, priority: 'low' },
  { loan: 350000, term: 25, rate: 4.5, priority: 'low' },
  { loan: 350000, term: 25, rate: 5.5, priority: 'low' },
  { loan: 350000, term: 25, rate: 6.0, priority: 'low' },
  { loan: 350000, term: 25, rate: 6.5, priority: 'low' },
  
  { loan: 400000, term: 25, rate: 3.0, priority: 'low' },
  { loan: 400000, term: 25, rate: 3.5, priority: 'low' },
  { loan: 400000, term: 25, rate: 4.5, priority: 'low' },
  { loan: 400000, term: 25, rate: 5.5, priority: 'low' },
  { loan: 400000, term: 25, rate: 6.0, priority: 'low' },
  { loan: 400000, term: 25, rate: 6.5, priority: 'low' },
  
  { loan: 450000, term: 25, rate: 3.0, priority: 'low' },
  { loan: 450000, term: 25, rate: 3.5, priority: 'low' },
  { loan: 450000, term: 25, rate: 4.5, priority: 'low' },
  { loan: 450000, term: 25, rate: 5.5, priority: 'low' },
  { loan: 450000, term: 25, rate: 6.0, priority: 'low' },
  { loan: 450000, term: 25, rate: 6.5, priority: 'low' },
  
  { loan: 500000, term: 25, rate: 3.0, priority: 'low' },
  { loan: 500000, term: 25, rate: 3.5, priority: 'low' },
  { loan: 500000, term: 25, rate: 4.5, priority: 'low' },
  { loan: 500000, term: 25, rate: 5.5, priority: 'low' },
  { loan: 500000, term: 25, rate: 6.0, priority: 'low' },
  { loan: 500000, term: 25, rate: 6.5, priority: 'low' },

  // Different term variations for popular amounts
  { loan: 300000, term: 15, rate: 4.0, priority: 'low' },
  { loan: 300000, term: 15, rate: 5.0, priority: 'low' },
  { loan: 300000, term: 40, rate: 4.0, priority: 'low' },
  { loan: 300000, term: 40, rate: 5.0, priority: 'low' },
  
  { loan: 400000, term: 15, rate: 4.0, priority: 'low' },
  { loan: 400000, term: 15, rate: 5.0, priority: 'low' },
  { loan: 400000, term: 40, rate: 4.0, priority: 'low' },
  { loan: 400000, term: 40, rate: 5.0, priority: 'low' },
  
  { loan: 500000, term: 15, rate: 4.0, priority: 'low' },
  { loan: 500000, term: 15, rate: 5.0, priority: 'low' },
  { loan: 500000, term: 40, rate: 4.0, priority: 'low' },
  { loan: 500000, term: 40, rate: 5.0, priority: 'low' },
]

// Helper function to filter combinations by priority
export function getCombinationsByPriority(priority: 'high' | 'medium' | 'low'): MortgageCombination[] {
  return mortgageCombinations.filter(combo => combo.priority === priority)
}

// Helper function to get all combinations up to a certain priority
export function getCombinationsUpToPriority(maxPriority: 'high' | 'medium' | 'low'): MortgageCombination[] {
  const priorities = ['high', 'medium', 'low']
  const maxIndex = priorities.indexOf(maxPriority)
  
  return mortgageCombinations.filter(combo => 
    priorities.indexOf(combo.priority) <= maxIndex
  )
}

// Get the total count of combinations
export const totalCombinations = mortgageCombinations.length 