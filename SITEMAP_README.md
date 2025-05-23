# SEO Sitemap Generation for MortgaSim

This project includes automated sitemap generation for SEO-optimized mortgage landing pages.

## Features

- ✅ **Dynamic URL Generation**: Creates SEO-friendly URLs like `/mortgage/300k-over-25-years-at-4-percent`
- ✅ **Prioritized Sitemaps**: Generates separate sitemaps for high, medium, and low priority combinations
- ✅ **URL Parameter Parsing**: Supports both slug format and query parameters
- ✅ **Pre-filled Forms**: Automatically fills mortgage form with URL parameters
- ✅ **SEO Meta Tags**: Dynamic title, description, and Open Graph tags
- ✅ **OG Image Support**: Placeholder for dynamic OG image generation
- ✅ **ISR Ready**: Designed to work with static generation and on-demand ISR

## URL Format

The router supports these URL patterns:

### Slug Format (Recommended)
```
/mortgage/300k-over-25-years-at-4-percent
/mortgage/200k-over-30-years-at-5-percent
/mortgage/450k-over-20-years-at-3.5-percent
```

### Query Parameter Format (Fallback)
```
/mortgage?loan=300000&term=25&rate=4.0
/mortgage?loan=200000&term=30&rate=5.0
```

## Usage

### Generate Sitemaps

```bash
# Generate all sitemaps, robots.txt, and show statistics
npm run sitemap

# Show statistics only
npm run sitemap:stats

# Generate robots.txt only
npm run sitemap:robots
```

### Manual Script Usage

```bash
# Generate complete sitemap structure
node scripts/generate-sitemap.js

# Generate with custom base URL
node scripts/generate-sitemap.js all https://yourdomain.com

# Generate with custom output directory
node scripts/generate-sitemap.js all https://yourdomain.com ./dist
```

## Generated Files

The script generates the following files in the `public` directory:

- `sitemap.xml` - Main sitemap index
- `sitemap-mortgages-high.xml` - High priority mortgage combinations
- `sitemap-mortgages-medium.xml` - Medium priority mortgage combinations  
- `sitemap-mortgages-low.xml` - Low priority mortgage combinations
- `robots.txt` - Search engine crawler instructions

## Mortgage Combinations

The system includes **152+ pre-configured mortgage combinations** across three priority levels:

### High Priority (28 combinations)
- Common loan amounts: £200k - £500k
- Popular terms: 25 and 30 years
- Standard rates: 4.0% and 5.0%

### Medium Priority (56 combinations)
- Extended terms: 20 and 35 years
- Additional rates: 3.5%, 4.5%, 5.5%, 6.0%
- Same loan amount range

### Low Priority (68+ combinations)
- Edge case amounts: £150k, £175k, £550k+
- Uncommon terms: 15 and 40 years
- Extended rate range: 3.0% - 6.5%

## SEO Configuration

Each sitemap entry includes:

- **URL**: SEO-friendly slug format
- **Last Modified**: Current date
- **Change Frequency**: 
  - High priority: daily
  - Medium priority: weekly  
  - Low priority: monthly
- **Priority Score**:
  - High priority: 0.8
  - Medium priority: 0.6
  - Low priority: 0.4

## Dynamic Page Features

Each generated landing page includes:

1. **Pre-filled Form**: Mortgage calculator with URL parameters
2. **SEO Meta Tags**: Dynamic title and description
3. **Open Graph Tags**: Social media sharing optimization
4. **Structured Data Ready**: Easy to add JSON-LD schemas
5. **Auto-simulation**: Runs calculation on page load

## Example Generated URLs

```
https://www.mortgasim.com/mortgage/200k-over-25-years-at-4-percent
https://www.mortgasim.com/mortgage/250k-over-30-years-at-5-percent
https://www.mortgasim.com/mortgage/300k-over-25-years-at-4.5-percent
https://www.mortgasim.com/mortgage/400k-over-20-years-at-3.5-percent
https://www.mortgasim.com/mortgage/500k-over-35-years-at-6-percent
```

## Customization

### Adding More Combinations

Edit `src/config/mortgageCombinations.ts` to add more mortgage combinations:

```typescript
{ loan: 320000, term: 25, rate: 4.2, priority: 'medium' },
```

### Changing URL Format

Modify the slug generation in `src/utils/urlParser.ts`:

```typescript
export function generateMortgageSlug(loan: number, term: number, rate: number): string {
  // Customize the URL format here
}
```

### SEO Meta Tags

Update the meta tag generation in `src/pages/DynamicMortgagePage.tsx`:

```typescript
const title = `Custom title for ${loanFormatted} mortgage...`;
```

## Build Integration

### For Static Generation (SSG)
1. Generate sitemaps during build: `npm run sitemap`
2. Pre-render high priority pages
3. Enable ISR for medium/low priority pages

### For Vercel Deployment
Add to `vercel.json`:

```json
{
  "builds": [
    { "src": "package.json", "use": "@vercel/static-build" }
  ],
  "routes": [
    { "src": "/sitemap.xml", "dest": "/sitemap.xml" },
    { "src": "/robots.txt", "dest": "/robots.txt" },
    { "src": "/mortgage/(.*)", "dest": "/index.html" }
  ]
}
```

## Performance Considerations

- **Total URLs**: ~152 combinations (easily scalable to 500+)
- **File Sizes**: Each sitemap ~50KB with 1000 URLs
- **Build Time**: <1 second for sitemap generation
- **SEO Impact**: Improved indexation and long-tail keyword coverage

## Analytics & Monitoring

Consider tracking:
- Page views by URL pattern
- Conversion rates by mortgage amount/term
- Search console performance for generated URLs
- Top performing mortgage combinations

## Future Enhancements

- [ ] Dynamic OG image generation API
- [ ] JSON-LD structured data for mortgage calculators
- [ ] Automatic sitemap updates on deployment
- [ ] A/B testing for different URL formats
- [ ] Regional mortgage rate variations
- [ ] Multi-language support for international markets

---

For questions or issues, check the main README.md or create an issue in the repository. 