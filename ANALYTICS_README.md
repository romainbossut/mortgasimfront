# Vercel Analytics Integration

This project now includes comprehensive Vercel Analytics tracking to monitor user behavior across the mortgage simulation app and SEO-optimized landing pages.

## 🚀 **Analytics Setup**

### Installation
```bash
npm install @vercel/analytics
```

### Integration
- ✅ **Main App**: Analytics component added to `src/main.tsx`
- ✅ **Dynamic Pages**: Custom event tracking in `src/pages/DynamicMortgagePage.tsx`
- ✅ **Home Page**: Custom event tracking in `src/pages/MortgageSimulation.tsx`

## 📊 **Events Being Tracked**

### Page Views
- **`home_page_visit`**: Tracks visits to the main mortgage calculator page
- **`mortgage_page_visit`**: Tracks visits to dynamic mortgage landing pages with parameters:
  - `loan_amount`, `term_years`, `interest_rate`
  - `url_format` (slug vs query)
  - `page_url`

### User Interactions
- **`mortgage_form_submitted`**: Tracks manual form submissions with mortgage parameters
- **`mortgage_simulation_completed`**: Tracks successful mortgage calculations with:
  - Mortgage parameters
  - Warning information
  - Auto-load vs manual submission
- **`mortgage_simulation_error`**: Tracks simulation failures with error details

### Data Export
- **`csv_export_started`**: Tracks when users initiate CSV exports
- **`csv_export_completed`**: Tracks successful exports with file size
- **`csv_export_error`**: Tracks export failures

## 🎯 **Key Insights Available**

### SEO Performance
- Track which mortgage combinations get the most traffic
- Monitor conversion rates from specific landing pages
- Identify high-performing URL formats (slug vs query)

### User Behavior
- Form completion rates
- Most popular mortgage scenarios
- Error patterns and common issues
- Export usage patterns

### Business Metrics
- Simulation success rates
- Popular loan amounts and terms
- Geographic patterns (if enabled)
- User journey through dynamic pages

## 📈 **Analytics Dashboard**

Once deployed to Vercel, analytics will be available at:
```
https://vercel.com/[your-team]/[your-project]/analytics
```

### Key Metrics to Monitor
1. **Page Views**: Total visits and unique visitors
2. **Conversion Funnel**: 
   - Page visit → Form interaction → Simulation completion
3. **Top Pages**: Most visited mortgage combinations
4. **Error Rates**: Simulation and export failure rates
5. **User Retention**: Return visitors to specific mortgage scenarios

## 🔧 **Configuration**

### Custom Properties
All events include relevant mortgage parameters:
- `loan_amount` (string)
- `term_years` (string) 
- `interest_rate` (string)
- `page_type` ('home' | 'dynamic')
- `url_format` ('slug' | 'query')

### Error Tracking
Comprehensive error handling with:
- Error messages
- Context (which action failed)
- User parameters when error occurred

## ⚠️ **Known Issues**

### TypeScript Error
There's a current TypeScript compilation error in error handling:
```
Property 'message' does not exist on type '{}'
```

**Solution**: Add this to your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

Or create a more specific error type in `src/types/error.ts`:
```typescript
export type AppError = Error | { message: string } | string | unknown;
```

## 🚀 **Usage Examples**

### Track Custom Events
```typescript
import { track } from '@vercel/analytics'

// Track specific user actions
track('custom_event', {
  property1: 'value1',
  property2: 'value2'
})
```

### Filter Analytics Data
Use custom properties to filter dashboard data:
- Filter by loan amount ranges
- Group by interest rate ranges  
- Segment by page type
- Track specific mortgage scenarios

## 📊 **ROI Tracking**

With this analytics setup, you can measure:

1. **SEO ROI**: Which landing page combinations drive the most engagement
2. **Content Performance**: Most effective mortgage scenarios
3. **User Experience**: Where users encounter issues
4. **Feature Usage**: CSV exports, form interactions, etc.

## 🔮 **Future Enhancements**

Consider adding:
- [ ] Geographic data for regional mortgage insights
- [ ] A/B testing for different URL formats
- [ ] Funnel analysis for multi-step interactions
- [ ] Custom dimensions for mortgage product types
- [ ] Integration with Google Analytics for cross-platform insights

## 🐛 **Troubleshooting**

### Analytics Not Showing
1. Ensure you're deployed to Vercel
2. Check the Vercel dashboard for analytics tab
3. Wait 24-48 hours for initial data

### Events Not Firing
1. Check browser console for errors
2. Verify imports are correct
3. Ensure events are called after user interactions

### TypeScript Errors
1. Add `"skipLibCheck": true` to tsconfig.json
2. Use the error utility function provided
3. Consider upgrading TypeScript version

---

The analytics integration provides deep insights into how users interact with your mortgage simulation tool and SEO landing pages, enabling data-driven optimization of both user experience and search performance. 