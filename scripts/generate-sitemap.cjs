#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Simplified version of the mortgage combinations for easier CommonJS usage
const mortgageCombinations = [
  // High priority - most common loan amounts and terms
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

  // Medium priority
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

  // Low priority examples (subset for demo)
  { loan: 150000, term: 25, rate: 4.0, priority: 'low' },
  { loan: 150000, term: 25, rate: 5.0, priority: 'low' },
  { loan: 175000, term: 25, rate: 4.0, priority: 'low' },
  { loan: 175000, term: 25, rate: 5.0, priority: 'low' },
  { loan: 550000, term: 25, rate: 4.0, priority: 'low' },
  { loan: 550000, term: 25, rate: 5.0, priority: 'low' },
  { loan: 600000, term: 25, rate: 4.0, priority: 'low' },
  { loan: 600000, term: 25, rate: 5.0, priority: 'low' },
];

function generateMortgageSlug(loan, term, rate) {
  const loanDisplay = loan >= 1000 
    ? `${(loan / 1000).toString().replace(/\.0$/, '')}k`
    : loan.toString();
  
  const rateDisplay = rate.toString().replace(/\.0$/, '');
  
  return `${loanDisplay}-over-${term}-years-at-${rateDisplay}-percent`;
}

function getCombinationsByPriority(priority) {
  return mortgageCombinations.filter(combo => combo.priority === priority);
}

function getCombinationsUpToPriority(maxPriority) {
  const priorities = ['high', 'medium', 'low'];
  const maxIndex = priorities.indexOf(maxPriority);
  
  return mortgageCombinations.filter(combo => 
    priorities.indexOf(combo.priority) <= maxIndex
  );
}

class SitemapGenerator {
  constructor(baseUrl = 'https://mortgasim.com', outputDir = './public') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.outputDir = outputDir;
  }

  generateSitemapXml(urls) {
    const urlEntries = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${this.baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>${urlEntries}
</urlset>`;
  }

  generateSitemapIndex(sitemapFiles) {
    const sitemapEntries = sitemapFiles.map(file => `
  <sitemap>
    <loc>${this.baseUrl}/${file}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries}
</sitemapindex>`;
  }

  getPriorityValue(priority) {
    switch (priority) {
      case 'high': return '0.8';
      case 'medium': return '0.6';
      case 'low': return '0.4';
      default: return '0.5';
    }
  }

  getChangeFreq(priority) {
    switch (priority) {
      case 'high': return 'daily';
      case 'medium': return 'weekly';
      case 'low': return 'monthly';
      default: return 'weekly';
    }
  }

  generatePrioritizedSitemaps() {
    const sitemapFiles = [];
    const lastmod = new Date().toISOString().split('T')[0];

    const priorities = ['high', 'medium', 'low'];
    
    priorities.forEach(priority => {
      const combinations = getCombinationsByPriority(priority);
      if (combinations.length === 0) return;

      const urls = combinations.map(combo => {
        const slug = generateMortgageSlug(combo.loan, combo.term, combo.rate);
        return {
          loc: `${this.baseUrl}/mortgage/${slug}`,
          lastmod,
          changefreq: this.getChangeFreq(combo.priority),
          priority: this.getPriorityValue(combo.priority),
        };
      });

      const sitemapContent = this.generateSitemapXml(urls);
      const filename = `sitemap-mortgages-${priority}.xml`;
      const filepath = path.join(this.outputDir, filename);

      // Ensure output directory exists
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      fs.writeFileSync(filepath, sitemapContent);
      sitemapFiles.push(filename);
      console.log(`✓ Generated ${filename} with ${urls.length} URLs (${priority} priority)`);
    });

    return sitemapFiles;
  }

  generateMainSitemap() {
    const sitemapFiles = this.generatePrioritizedSitemaps();
    
    const sitemapIndexContent = this.generateSitemapIndex(sitemapFiles);
    const indexPath = path.join(this.outputDir, 'sitemap.xml');
    
    fs.writeFileSync(indexPath, sitemapIndexContent);
    console.log(`✓ Generated sitemap.xml (index) referencing ${sitemapFiles.length} sitemaps`);
  }

  generateRobotsTxt() {
    const robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${this.baseUrl}/sitemap.xml

# Crawl-delay
Crawl-delay: 1`;

    const robotsPath = path.join(this.outputDir, 'robots.txt');
    fs.writeFileSync(robotsPath, robotsContent);
    console.log(`✓ Generated robots.txt`);
  }

  generateStats() {
    const highPriorityCount = getCombinationsByPriority('high').length;
    const mediumPriorityCount = getCombinationsByPriority('medium').length;
    const lowPriorityCount = getCombinationsByPriority('low').length;
    const totalCount = mortgageCombinations.length;

    console.log('\n📊 Sitemap Statistics:');
    console.log(`   High priority URLs: ${highPriorityCount}`);
    console.log(`   Medium priority URLs: ${mediumPriorityCount}`);
    console.log(`   Low priority URLs: ${lowPriorityCount}`);
    console.log(`   Total URLs: ${totalCount}`);
    console.log('\n🔗 Example URLs:');
    
    const examples = getCombinationsByPriority('high').slice(0, 3);
    examples.forEach(combo => {
      const slug = generateMortgageSlug(combo.loan, combo.term, combo.rate);
      console.log(`   ${this.baseUrl}/mortgage/${slug}`);
    });
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  const baseUrl = args[1] || 'https://mortgasim.com';
  const outputDir = args[2] || './public';

  const generator = new SitemapGenerator(baseUrl, outputDir);

  console.log('🚀 Generating SEO sitemaps...\n');

  switch (command) {
    case 'stats':
      generator.generateStats();
      break;
    case 'robots':
      generator.generateRobotsTxt();
      break;
    case 'all':
    default:
      generator.generateMainSitemap();
      generator.generateRobotsTxt();
      generator.generateStats();
      break;
  }

  console.log('\n✅ Sitemap generation complete!');
}

if (require.main === module) {
  main();
}

module.exports = { SitemapGenerator }; 