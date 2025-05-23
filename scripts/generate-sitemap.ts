#!/usr/bin/env node
import * as fs from 'fs'
import * as path from 'path'
import { mortgageCombinations, getCombinationsByPriority, getCombinationsUpToPriority } from '../src/config/mortgageCombinations.js'
import { generateMortgageSlug } from '../src/utils/urlParser.js'

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

class SitemapGenerator {
  private baseUrl: string;
  private outputDir: string;

  constructor(baseUrl: string = 'https://www.mortgasim.com', outputDir: string = './public') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.outputDir = outputDir;
  }

  private generateSitemapXml(urls: SitemapUrl[]): string {
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

  private generateSitemapIndex(sitemapFiles: string[]): string {
    const sitemapEntries = sitemapFiles.map(file => `
  <sitemap>
    <loc>${this.baseUrl}/${file}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries}
</sitemapindex>`;
  }

  private getPriorityValue(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high': return '0.8';
      case 'medium': return '0.6';
      case 'low': return '0.4';
      default: return '0.5';
    }
  }

  private getChangeFreq(priority: 'high' | 'medium' | 'low'): 'daily' | 'weekly' | 'monthly' {
    switch (priority) {
      case 'high': return 'daily';
      case 'medium': return 'weekly';
      case 'low': return 'monthly';
      default: return 'weekly';
    }
  }

  public generateMortgageSitemap(maxPriority: 'high' | 'medium' | 'low' = 'medium'): void {
    const combinations = getCombinationsUpToPriority(maxPriority);
    const lastmod = new Date().toISOString().split('T')[0];

    const urls: SitemapUrl[] = combinations.map(combo => {
      const slug = generateMortgageSlug(combo.loan, combo.term, combo.rate);
      return {
        loc: `${this.baseUrl}/mortgage/${slug}`,
        lastmod,
        changefreq: this.getChangeFreq(combo.priority),
        priority: this.getPriorityValue(combo.priority),
      };
    });

    const sitemapContent = this.generateSitemapXml(urls);
    const filename = `sitemap-mortgages.xml`;
    const filepath = path.join(this.outputDir, filename);

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    fs.writeFileSync(filepath, sitemapContent);
    console.log(`✓ Generated ${filename} with ${urls.length} URLs`);
  }

  public generatePrioritizedSitemaps(): string[] {
    const sitemapFiles: string[] = [];
    const lastmod = new Date().toISOString().split('T')[0];

    // Generate separate sitemaps for each priority level
    const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    
    priorities.forEach(priority => {
      const combinations = getCombinationsByPriority(priority);
      if (combinations.length === 0) return;

      const urls: SitemapUrl[] = combinations.map(combo => {
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

      fs.writeFileSync(filepath, sitemapContent);
      sitemapFiles.push(filename);
      console.log(`✓ Generated ${filename} with ${urls.length} URLs (${priority} priority)`);
    });

    return sitemapFiles;
  }

  public generateMainSitemap(): void {
    const sitemapFiles = this.generatePrioritizedSitemaps();
    
    // Generate main sitemap index
    const sitemapIndexContent = this.generateSitemapIndex(sitemapFiles);
    const indexPath = path.join(this.outputDir, 'sitemap.xml');
    
    fs.writeFileSync(indexPath, sitemapIndexContent);
    console.log(`✓ Generated sitemap.xml (index) referencing ${sitemapFiles.length} sitemaps`);
  }

  public generateRobotsTxt(): void {
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

  public generateStats(): void {
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
    
    // Show a few examples
    const examples = getCombinationsByPriority('high').slice(0, 3);
    examples.forEach(combo => {
      const slug = generateMortgageSlug(combo.loan, combo.term, combo.rate);
      console.log(`   ${this.baseUrl}/mortgage/${slug}`);
    });
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  const baseUrl = args[1] || 'https://www.mortgasim.com';
  const outputDir = args[2] || './public';

  const generator = new SitemapGenerator(baseUrl, outputDir);

  console.log('🚀 Generating SEO sitemaps...\n');

  switch (command) {
    case 'high':
      generator.generateMortgageSitemap('high');
      break;
    case 'medium':
      generator.generateMortgageSitemap('medium');
      break;
    case 'low':
      generator.generateMortgageSitemap('low');
      break;
    case 'prioritized':
      generator.generatePrioritizedSitemaps();
      break;
    case 'robots':
      generator.generateRobotsTxt();
      break;
    case 'stats':
      generator.generateStats();
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

// Export for programmatic use
export { SitemapGenerator };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 