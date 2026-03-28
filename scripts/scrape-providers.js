#!/usr/bin/env node

/**
 * Jobsy Jamaica Service Provider Scraper
 *
 * Scrapes FindYello (Jamaica Yellow Pages) across all service categories,
 * deduplicates against existing database records, and imports new providers.
 *
 * Usage: node scripts/scrape-providers.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { PrismaClient } = require('../packages/database/dist/index.js');

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:TRmnVNmXLMsuAkFNJcxErHnzCENpgTFL@switchback.proxy.rlwy.net:35094/railway',
});

// Category mapping: FindYello slug -> Jobsy category name + category ID
const CATEGORY_MAP = {
  'plumbers': { name: 'Plumbing', id: '303b101e-6984-48ed-9d60-043669d69364' },
  'electrical-contractors': { name: 'Electrical', id: 'de8cac79-adf5-4b74-9d2c-2ac22b141093' },
  'electricians': { name: 'Electrical', id: 'de8cac79-adf5-4b74-9d2c-2ac22b141093' },
  'building-contractors': { name: 'Construction', id: 'b2936cd0-a682-43dc-b151-e55e89fc2cde' },
  'general-contractors': { name: 'Construction', id: 'b2936cd0-a682-43dc-b151-e55e89fc2cde' },
  'roofing-contractors': { name: 'Construction', id: 'b2936cd0-a682-43dc-b151-e55e89fc2cde' },
  'tile-contractors-dealers': { name: 'Construction', id: 'b2936cd0-a682-43dc-b151-e55e89fc2cde' },
  'fencing': { name: 'Construction', id: 'b2936cd0-a682-43dc-b151-e55e89fc2cde' },
  'welding': { name: 'Construction', id: 'b2936cd0-a682-43dc-b151-e55e89fc2cde' },
  'carpenters': { name: 'Construction', id: 'b2936cd0-a682-43dc-b151-e55e89fc2cde' },
  'beauty-salons': { name: 'Beauty & Hair', id: '0c21c2c9-cb8a-448d-af2c-6ae465925fe7' },
  'barbers': { name: 'Beauty & Hair', id: '0c21c2c9-cb8a-448d-af2c-6ae465925fe7' },
  'caterers': { name: 'Catering', id: '2306bf73-7e1a-4937-beba-fdc039c01190' },
  'auto-repairs': { name: 'Auto Repair', id: 'b2d1c354-2c87-4672-911c-e3aa94422dd6' },
  'automobile-repairing-service': { name: 'Auto Repair', id: 'b2d1c354-2c87-4672-911c-e3aa94422dd6' },
  'painting-contractors': { name: 'Painting', id: 'ad67e7ba-8e16-4de2-a033-41fb8fa77de6' },
  'landscape-contractors-designers': { name: 'Landscaping', id: '8b75fcf6-6db9-426d-9ccd-0ce1a6a0f05a' },
  'landscaping-gardening': { name: 'Landscaping', id: '8b75fcf6-6db9-426d-9ccd-0ce1a6a0f05a' },
  'photographers': { name: 'Photography', id: '91712ffb-90a8-408c-bfe7-fd3a610cdecb' },
  'security-guard-patrol-service': { name: 'Other', id: '218d9f58-9eb1-495e-a8d3-b8ff4968b556' },
  'pest-control': { name: 'Other', id: '218d9f58-9eb1-495e-a8d3-b8ff4968b556' },
  'air-conditioning-contractors': { name: 'Other', id: '218d9f58-9eb1-495e-a8d3-b8ff4968b556' },
  'moving-storage': { name: 'Moving', id: 'c8c67347-d747-4ed8-a867-b5fc928d8b2d' },
  'janitor-service': { name: 'Home Cleaning', id: 'b8b17ede-9017-44a4-96b0-82496ca5fd11' },
  'locksmiths': { name: 'Other', id: '218d9f58-9eb1-495e-a8d3-b8ff4968b556' },
  'florists': { name: 'Other', id: '218d9f58-9eb1-495e-a8d3-b8ff4968b556' },
  'swimming-pool-contractors-dealers-design': { name: 'Other', id: '218d9f58-9eb1-495e-a8d3-b8ff4968b556' },
  'furniture-repair-refinishing': { name: 'Other', id: '218d9f58-9eb1-495e-a8d3-b8ff4968b556' },
  'appliance-repairs': { name: 'Other', id: '218d9f58-9eb1-495e-a8d3-b8ff4968b556' },
  'upholstery': { name: 'Tailoring', id: 'fd8056f2-ab1c-41fe-83e3-8dcc78fd547f' },
  'glass-auto-plate-window': { name: 'Auto Repair', id: 'b2d1c354-2c87-4672-911c-e3aa94422dd6' },
  'party-supplies-rental': { name: 'Event Planning', id: '58d23ce3-a78f-4830-b7ba-75e293af7cb4' },
  'tutoring': { name: 'Tutoring', id: '0cd3f3f2-b293-4777-823c-2408937f2aa7' },
  'pet-shops': { name: 'Pet Care', id: 'eaaf5640-5e23-4467-b41f-c3ab4a941fc7' },
  'veterinarians': { name: 'Pet Care', id: 'eaaf5640-5e23-4467-b41f-c3ab4a941fc7' },
  'gymnasiums': { name: 'Fitness Training', id: '6d8c196b-054a-4f4c-9d37-58bba6a53f1a' },
  'tailors': { name: 'Tailoring', id: 'fd8056f2-ab1c-41fe-83e3-8dcc78fd547f' },
  'cellular-phone-accessories-equipment-repairs': { name: 'Tech Support', id: '634226fd-243d-41bd-a597-82a56c710783' },
  'computer-dealers-retail': { name: 'Tech Support', id: '634226fd-243d-41bd-a597-82a56c710783' },
};

const PARISHES = [
  'Kingston', 'St. Andrew', 'St. Thomas', 'Portland', 'St. Mary',
  'St. Ann', 'Trelawny', 'St. James', 'Hanover', 'Westmoreland',
  'St. Elizabeth', 'Manchester', 'Clarendon', 'St. Catherine',
];

const CLOSED_MARKERS = [
  'permanently closed', 'temporarily closed', 'closed permanently',
  'no longer in business', 'out of business',
];

// Rate limiting
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Normalize business name for deduplication
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\b(ltd|limited|inc|incorporated|co|company|corp|llc|services?|servs?)\b/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract parish from text
function extractParish(text) {
  for (const p of PARISHES) {
    if (text.includes(p)) return p;
  }
  // Common area -> parish mappings
  if (text.includes('Montego Bay') || text.includes('MoBay')) return 'St. James';
  if (text.includes('Mandeville')) return 'Manchester';
  if (text.includes('Spanish Town') || text.includes('Portmore')) return 'St. Catherine';
  if (text.includes('Ocho Rios') || text.includes('Runaway Bay')) return 'St. Ann';
  if (text.includes('May Pen')) return 'Clarendon';
  if (text.includes('Negril')) return 'Westmoreland';
  if (text.includes('Port Antonio')) return 'Portland';
  if (text.includes('Morant Bay')) return 'St. Thomas';
  if (text.includes('Falmouth')) return 'Trelawny';
  if (text.includes('Lucea')) return 'Hanover';
  if (text.includes('Black River') || text.includes('Santa Cruz')) return 'St. Elizabeth';
  if (text.includes('Half Way Tree') || text.includes('New Kingston') || text.includes('Liguanea')) return 'St. Andrew';
  return null;
}

// Check if business appears active (not closed)
function isActive(provider) {
  const text = `${provider.businessName} ${provider.description || ''}`.toLowerCase();
  for (const marker of CLOSED_MARKERS) {
    if (text.includes(marker)) return false;
  }
  // Businesses listed on directories like FindYello are active by default
  // Only exclude if they have an explicit "closed" marker
  return true;
}

// -------------------------------------------------------------------------
// FindYello Scraper
// -------------------------------------------------------------------------

async function scrapeFindYelloPage(slug, pageNum) {
  const url = pageNum === 1
    ? `https://www.findyello.com/jamaica/${slug}/`
    : `https://www.findyello.com/jamaica/${slug}/pageno=${pageNum}`;

  try {
    const { data: html } = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const $ = cheerio.load(html);
    const providers = [];

    // Extract listings - FindYello uses profile links as the main identifier
    const profileLinks = $('a[href*="/profile/"]');
    const seen = new Set();

    profileLinks.each((_, el) => {
      const name = $(el).text().trim();
      if (name.length < 4 || ['Directions', 'Advertisements', 'View Profile', 'Call Us'].includes(name) || seen.has(name)) return;
      seen.add(name);

      // Walk up to find the listing container
      let container = $(el).closest('.store-listing, .listing-item, .col-12, [class*="store"], [class*="listing"]');
      if (!container.length) container = $(el).parent().parent().parent();

      const containerText = container.text() || '';

      // Extract phone
      const phoneMatch = containerText.match(/876[\s-]?\d{3}[\s-]?\d{4}/);
      const phone = phoneMatch ? '+1' + phoneMatch[0].replace(/[\s-]/g, '') : null;

      // Extract parish
      const parish = extractParish(containerText) || 'Kingston';

      // Extract address
      const addressEl = container.find('[class*="address"], .location');
      const address = addressEl.length ? addressEl.text().trim().replace(/\n/g, ', ').slice(0, 200) : null;

      // Extract description
      const descEl = container.find('p, [class*="description"]');
      let description = null;
      descEl.each((_, d) => {
        const t = $(d).text().trim();
        if (t.length > 30 && t.length < 500 && !t.includes('Call Us') && !t.includes('Open Now')) {
          description = t;
          return false;
        }
      });

      // Extract image
      const imgEl = container.find('img[src*="cloudinary"], img[src*="yello"], img[src*="store"]');
      let imageUrl = null;
      if (imgEl.length) {
        const src = imgEl.attr('src') || imgEl.attr('data-src');
        if (src && !src.includes('placeholder') && !src.includes('default') && !src.includes('logo')) {
          imageUrl = src.startsWith('//') ? 'https:' + src : src;
        }
      }

      // Source URL
      const href = $(el).attr('href');
      const sourceUrl = href ? (href.startsWith('http') ? href : 'https://www.findyello.com' + href) : null;

      providers.push({
        businessName: name,
        phone,
        parish,
        address,
        description,
        imageUrl,
        sourceUrl,
      });
    });

    // Check total count from page header
    const headerText = $('body').text();
    const totalMatch = headerText.match(/(\d+)\s+\w[\w\s]*found/i);
    const totalOnSite = totalMatch ? parseInt(totalMatch[1], 10) : 0;

    return { providers, totalOnSite, hasMore: providers.length >= 14 };
  } catch (err) {
    if (err.response?.status === 403) {
      console.log(`  [403] Blocked on ${slug} p${pageNum}, skipping`);
    } else if (err.response?.status === 404) {
      // Category doesn't exist
    } else {
      console.log(`  [error] ${slug} p${pageNum}: ${err.message}`);
    }
    return { providers: [], totalOnSite: 0, hasMore: false };
  }
}

async function scrapeFindYelloCategory(slug) {
  const catInfo = CATEGORY_MAP[slug] || { name: 'Other', id: '218d9f58-9eb1-495e-a8d3-b8ff4968b556' };
  const allProviders = [];
  let page = 1;
  const maxPages = 15;

  while (page <= maxPages) {
    const { providers, hasMore } = await scrapeFindYelloPage(slug, page);

    for (const p of providers) {
      allProviders.push({
        ...p,
        category: catInfo.name,
        categoryId: catInfo.id,
        sourcePlatform: 'findyello',
      });
    }

    if (!hasMore || providers.length === 0) break;
    page++;
    await sleep(2000 + Math.random() * 1000); // 2-3s between pages
  }

  return allProviders;
}

// -------------------------------------------------------------------------
// Deduplication & Import
// -------------------------------------------------------------------------

async function loadExistingProviders() {
  const existing = await prisma.unclaimedProvider.findMany({
    select: { businessName: true, phone: true },
  });

  const nameSet = new Set(existing.map(e => normalizeName(e.businessName)));
  const phoneSet = new Set(existing.filter(e => e.phone).map(e => e.phone));

  return { nameSet, phoneSet };
}

async function importProviders(providers, existingNames, existingPhones) {
  let imported = 0;
  let skipped = 0;
  let filtered = 0;

  for (const p of providers) {
    // Skip inactive businesses
    if (!isActive(p)) {
      filtered++;
      continue;
    }

    // Deduplicate by normalized name
    const normalized = normalizeName(p.businessName);
    if (existingNames.has(normalized)) {
      skipped++;
      continue;
    }

    // Deduplicate by phone number
    if (p.phone && existingPhones.has(p.phone)) {
      skipped++;
      continue;
    }

    try {
      await prisma.unclaimedProvider.create({
        data: {
          businessName: p.businessName,
          phone: p.phone || null,
          email: p.email || null,
          category: p.category,
          categoryId: p.categoryId || null,
          parish: p.parish || 'Kingston',
          address: p.address || null,
          description: p.description || null,
          imageUrl: p.imageUrl || null,
          sourceUrl: p.sourceUrl || null,
          sourcePlatform: p.sourcePlatform || 'scraper',
        },
      });
      existingNames.add(normalized);
      if (p.phone) existingPhones.add(p.phone);
      imported++;
    } catch (err) {
      skipped++;
    }
  }

  return { imported, skipped, filtered };
}

// -------------------------------------------------------------------------
// Main
// -------------------------------------------------------------------------

async function main() {
  console.log('=== Jobsy Provider Scraper ===');
  console.log('');

  // Load existing for dedup
  console.log('Loading existing providers for deduplication...');
  const { nameSet, phoneSet } = await loadExistingProviders();
  console.log(`  Existing: ${nameSet.size} unique names, ${phoneSet.size} unique phones`);
  console.log('');

  const allScraped = [];
  const slugs = Object.keys(CATEGORY_MAP);

  // Scrape FindYello categories
  console.log(`Scraping FindYello across ${slugs.length} categories...`);
  console.log('');

  for (const slug of slugs) {
    const catInfo = CATEGORY_MAP[slug];
    process.stdout.write(`  [${slug}] (${catInfo.name})... `);

    const providers = await scrapeFindYelloCategory(slug);
    allScraped.push(...providers);

    console.log(`${providers.length} found`);
    await sleep(3000 + Math.random() * 2000); // 3-5s between categories
  }

  console.log('');
  console.log(`Total scraped: ${allScraped.length} providers`);
  console.log('');

  // Import with dedup
  console.log('Importing new providers (deduplicating)...');
  const { imported, skipped, filtered } = await importProviders(allScraped, nameSet, phoneSet);

  console.log(`  Imported: ${imported}`);
  console.log(`  Skipped (duplicates): ${skipped}`);
  console.log(`  Filtered (inactive): ${filtered}`);
  console.log('');

  // Final count
  const total = await prisma.unclaimedProvider.count({ where: { isClaimed: false } });
  console.log(`Total unclaimed providers in database: ${total}`);
}

main()
  .catch(err => {
    console.error('Scraper failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
