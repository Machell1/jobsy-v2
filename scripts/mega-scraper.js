#!/usr/bin/env node

/**
 * Jobsy Mega Scraper V2 - Multi-Source Jamaica Service Provider Extraction
 *
 * Phase 1: Collect company URLs from JamaicaIndex category pages
 * Phase 2: Visit each company page to extract phone + parish
 * Phase 3: Scrape WorkandJam listing pages (phone on listing cards)
 * Phase 4: Scrape GOJEP government contractors
 * Phase 5: Deduplicate & import all with User + Service creation
 *
 * Usage: node scripts/mega-scraper.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const { PrismaClient } = require('../packages/database/dist/index.js');

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:TRmnVNmXLMsuAkFNJcxErHnzCENpgTFL@switchback.proxy.rlwy.net:35094/railway',
});

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

const CATEGORY_IDS = {
  'Plumbing': '303b101e-6984-48ed-9d60-043669d69364', 'Electrical': 'de8cac79-adf5-4b74-9d2c-2ac22b141093',
  'Home Cleaning': 'b8b17ede-9017-44a4-96b0-82496ca5fd11', 'Landscaping': '8b75fcf6-6db9-426d-9ccd-0ce1a6a0f05a',
  'Painting': 'ad67e7ba-8e16-4de2-a033-41fb8fa77de6', 'Moving': 'c8c67347-d747-4ed8-a867-b5fc928d8b2d',
  'Photography': '91712ffb-90a8-408c-bfe7-fd3a610cdecb', 'Catering': '2306bf73-7e1a-4937-beba-fdc039c01190',
  'Beauty & Hair': '0c21c2c9-cb8a-448d-af2c-6ae465925fe7', 'Auto Repair': 'b2d1c354-2c87-4672-911c-e3aa94422dd6',
  'Tech Support': '634226fd-243d-41bd-a597-82a56c710783', 'Pet Care': 'eaaf5640-5e23-4467-b41f-c3ab4a941fc7',
  'Fitness Training': '6d8c196b-054a-4f4c-9d37-58bba6a53f1a', 'Event Planning': '58d23ce3-a78f-4830-b7ba-75e293af7cb4',
  'Construction': 'b2936cd0-a682-43dc-b151-e55e89fc2cde', 'Tailoring': 'fd8056f2-ab1c-41fe-83e3-8dcc78fd547f',
  'Other': '218d9f58-9eb1-495e-a8d3-b8ff4968b556',
};

const PARISH_LIST = ['Kingston','St. Andrew','St. Thomas','Portland','St. Mary','St. Ann','Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth','Manchester','Clarendon','St. Catherine'];

const AREA_MAP = {
  'Montego Bay':'St. James','Mandeville':'Manchester','May Pen':'Clarendon','Spanish Town':'St. Catherine',
  'Portmore':'St. Catherine','Old Harbour':'St. Catherine','Linstead':'St. Catherine','Ocho Rios':'St. Ann',
  'Runaway Bay':'St. Ann','Port Antonio':'Portland','Morant Bay':'St. Thomas','Negril':'Westmoreland',
  'Savanna-la-Mar':'Westmoreland','Black River':'St. Elizabeth','Santa Cruz':'St. Elizabeth','Falmouth':'Trelawny',
  'Lucea':'Hanover','Port Maria':'St. Mary','Half Way Tree':'St. Andrew','New Kingston':'St. Andrew',
  'Liguanea':'St. Andrew','Cross Roads':'St. Andrew','Stony Hill':'St. Andrew','Constant Spring':'St. Andrew',
  'Knutsford':'St. Andrew','Saint Andrew':'St. Andrew','St Andrew':'St. Andrew',
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function normalizeName(n) { return n.toLowerCase().replace(/\b(ltd|limited|inc|co|company|corp|llc|services?|servs?)\b/g,'').replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,' ').trim(); }
function extractParish(text) {
  if (!text) return null;
  for (const p of PARISH_LIST) { if (text.includes(p)) return p; }
  for (const [a,p] of Object.entries(AREA_MAP)) { if (text.includes(a)) return p; }
  if (/Kingston\s+\d/i.test(text)) return 'Kingston';
  return null;
}
function cleanPhone(raw) {
  if (!raw) return null;
  const d = raw.replace(/[^\d]/g,'');
  if (d.length >= 10) {
    if (d.startsWith('1876')) return '+'+d;
    if (d.startsWith('876')) return '+1'+d;
  }
  return null;
}
function generateClaimCode() { return crypto.randomBytes(4).toString('hex').toUpperCase(); }
function randomPwHash() { return '$2a$12$'+crypto.randomBytes(30).toString('base64').slice(0,53); }

async function fetchPage(url, retries=1) {
  try {
    const { data } = await axios.get(url, { timeout: 20000, headers: HEADERS });
    return data;
  } catch(e) {
    if (retries > 0 && (e.response?.status >= 500 || e.code==='ECONNRESET')) {
      await sleep(8000);
      return fetchPage(url, retries-1);
    }
    return null;
  }
}

// ─── JamaicaIndex.com ───────────────────────────────────────

const JI_CATS = {
  'construction_services':'Construction','electrical_service':'Electrical',
  'cleaning_equipment_services':'Home Cleaning','photography':'Photography',
  'catering':'Catering','auto_repair':'Auto Repair','vehicle_services':'Auto Repair',
  'removals_and_relocation':'Moving','pest_control':'Other','locksmiths':'Other',
  'decorators':'Painting','remodeling':'Construction','roofing':'Construction',
  'handyman':'Other','gardeners':'Landscaping','carpentry':'Construction',
  'security_services':'Other','plumbing':'Plumbing','welding':'Construction',
  'painting':'Painting','fencing':'Construction','landscaping':'Landscaping',
  'pet_care':'Pet Care','fitness':'Fitness Training','beauty_salons':'Beauty & Hair',
  'barbers':'Beauty & Hair','tailoring':'Tailoring','event_planning':'Event Planning',
};

async function scrapeJamaicaIndex() {
  console.log('=== Source 1: JamaicaIndex.com ===');

  // Phase 1: Collect all unique company URLs
  console.log('  Collecting company URLs...');
  const companyUrls = new Map(); // url -> category

  for (const [slug, category] of Object.entries(JI_CATS)) {
    let page = 1;
    let found = 0;
    while (page <= 30) {
      const url = page === 1
        ? `https://www.jamaicaindex.com/category/${slug}`
        : `https://www.jamaicaindex.com/category/${slug}/${page}`;

      const html = await fetchPage(url);
      if (!html) break;

      const $ = cheerio.load(html);
      const seen = new Set();
      let pageCount = 0;
      $('a[href*="/company/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href || seen.has(href)) return;
        seen.add(href);
        const fullUrl = href.startsWith('http') ? href : 'https://www.jamaicaindex.com' + href;
        if (!companyUrls.has(fullUrl)) {
          companyUrls.set(fullUrl, category);
          found++;
        }
        pageCount++;
      });

      if (pageCount === 0) break;
      page++;
      await sleep(1500 + Math.random() * 500);
    }
    process.stdout.write(`  [${slug}] ${found} | `);
    if (Object.keys(JI_CATS).indexOf(slug) % 5 === 4) console.log('');
    await sleep(2000 + Math.random() * 1000);
  }

  console.log('');
  console.log(`  Total unique company URLs: ${companyUrls.size}`);

  // Phase 2: Visit each company page
  console.log('  Visiting company pages...');
  const providers = [];
  let idx = 0;
  let successCount = 0;

  for (const [url, category] of companyUrls) {
    idx++;
    if (idx % 25 === 0) console.log(`    ${idx}/${companyUrls.size} visited (${successCount} with phone)`);

    const html = await fetchPage(url);
    if (!html) { await sleep(1000); continue; }

    const $ = cheerio.load(html);
    const title = $('title').text() || '';
    const name = title.split(' - ')[0].split('|')[0].trim();
    if (!name || name.length < 3) continue;

    // Phone
    const telEl = $('a[href^="tel:"]').first();
    let phone = telEl.length ? cleanPhone(telEl.attr('href').replace('tel:', '')) : null;
    if (!phone) {
      // Fallback: regex on body
      const phoneMatch = $.root().text().match(/\(876\)\s*\d{3}[\s-]\d{4}|876[\s-]\d{3}[\s-]\d{4}/);
      phone = phoneMatch ? cleanPhone(phoneMatch[0]) : null;
    }
    if (!phone) continue; // Skip if no phone

    // Parish from title: "Name - City, Jamaica"
    const parish = extractParish(title) || extractParish($.root().text().slice(0, 1000)) || 'Kingston';

    // Address
    const addrEl = $('address, [itemprop="address"]').first();
    const address = addrEl.length ? addrEl.text().replace(/\s+/g,' ').trim().slice(0, 200) : null;

    providers.push({
      businessName: name, phone, parish,
      address, description: null, email: null,
      category, categoryId: CATEGORY_IDS[category] || CATEGORY_IDS['Other'],
      sourceUrl: url, sourcePlatform: 'jamaicaindex',
    });
    successCount++;

    await sleep(1200 + Math.random() * 800);
  }

  console.log(`  JamaicaIndex result: ${providers.length} providers with phone`);
  return providers;
}

// ─── WorkandJam.com ─────────────────────────────────────────

const WAJ_SUBS = [
  { path: '/bl/home-repairs/plumbers', cat: 'Plumbing' },
  { path: '/bl/home-repairs/electricians', cat: 'Electrical' },
  { path: '/bl/home-repairs/building-contractors', cat: 'Construction' },
  { path: '/bl/home-repairs/carpenters', cat: 'Construction' },
  { path: '/bl/home-repairs/paintings-works', cat: 'Painting' },
  { path: '/bl/home-repairs/roofing-companies', cat: 'Construction' },
  { path: '/bl/home-repairs/welding-services-supplies', cat: 'Construction' },
  { path: '/bl/home-repairs/fencing', cat: 'Construction' },
  { path: '/bl/home-repairs/a-c-technicians', cat: 'Other' },
  { path: '/bl/home-repairs/solar-wind-energy', cat: 'Electrical' },
  { path: '/bl/home-services', cat: 'Home Cleaning' },
  { path: '/bl/health-beauty', cat: 'Beauty & Hair' },
  { path: '/bl/transportation', cat: 'Moving' },
];

async function scrapeWorkandJam() {
  console.log('');
  console.log('=== Source 2: WorkandJam.com ===');
  const providers = [];

  for (const sub of WAJ_SUBS) {
    process.stdout.write(`  [${sub.path}] `);
    let page = 1;
    let subCount = 0;

    while (page <= 10) {
      const url = page === 1 ? `https://www.workandjam.com${sub.path}` : `https://www.workandjam.com${sub.path}/page/${page}`;
      const html = await fetchPage(url);
      if (!html) break;

      const $ = cheerio.load(html);
      const bodyText = $.root().text();

      // Find all "Phone:" patterns
      const blocks = bodyText.split(/Phone:/g);
      if (blocks.length <= 1) break;

      // Extract business names and phones
      $('a[href$=".htm"] strong, a[href$=".htm"] b').each((_, el) => {
        const name = $(el).text().trim();
        if (!name || name.length < 3) return;

        // Find phone near this element by walking up
        let container = $(el);
        for (let i = 0; i < 8; i++) {
          container = container.parent();
          const text = container.text();
          const phoneMatch = text.match(/Phone:\s*([+\d\s\-()]+)/);
          if (phoneMatch) {
            const phone = cleanPhone(phoneMatch[1]);
            if (!phone) return;

            const parish = extractParish(text) || 'Kingston';

            providers.push({
              businessName: name, phone, parish,
              address: null, description: null, email: null,
              category: sub.cat, categoryId: CATEGORY_IDS[sub.cat] || CATEGORY_IDS['Other'],
              sourceUrl: url, sourcePlatform: 'workandjam',
            });
            subCount++;
            return;
          }
        }
      });

      const hasNext = $('a:contains("NEXT"), a[href*="/page/"]').length > 0;
      if (!hasNext) break;
      page++;
      await sleep(2000 + Math.random() * 1000);
    }

    console.log(`${subCount}`);
    await sleep(3000);
  }

  console.log(`  WorkandJam result: ${providers.length}`);
  return providers;
}

// ─── GOJEP.gov.jm ──────────────────────────────────────────

async function scrapeGOJEP() {
  console.log('');
  console.log('=== Source 3: GOJEP.gov.jm ===');
  const providers = [];

  for (const catType of ['w14', 's14', 'g14']) {
    const url = `https://www.gojep.gov.jm/epps/ncc/listNccCategoryApprovedSuppliers.do?categoryType=${catType}`;
    const html = await fetchPage(url);
    if (!html) { console.log(`  Failed: ${catType}`); continue; }

    const $ = cheerio.load(html);
    $('table tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length < 3) return;
      const name = $(cells[0]).text().trim();
      const addr = $(cells[1]).text().trim();
      const phoneRaw = $(cells[2]).text().trim();
      if (!name || name.length < 3) return;
      const phone = cleanPhone(phoneRaw);
      if (!phone) return;
      const parish = extractParish(addr) || 'Kingston';

      providers.push({
        businessName: name, phone, parish,
        address: addr.slice(0,200), description: 'NCC approved contractor',
        email: null, category: 'Construction',
        categoryId: CATEGORY_IDS['Construction'],
        sourceUrl: url, sourcePlatform: 'gojep',
      });
    });
  }

  console.log(`  GOJEP result: ${providers.length}`);
  return providers;
}

// ─── Import ─────────────────────────────────────────────────

async function importAll(providers) {
  console.log('');
  console.log('=== Importing ===');

  const existing = await prisma.unclaimedProvider.findMany({ select: { id: true, businessName: true, phone: true, parish: true, claimedByUserId: true } });
  const nameMap = new Map();
  for (const e of existing) nameMap.set(normalizeName(e.businessName), e);
  const phoneSet = new Set(existing.filter(e=>e.phone).map(e=>e.phone));
  const existingUsers = await prisma.user.findMany({ where: { role: 'PROVIDER' }, select: { phone: true } });
  existingUsers.forEach(u => { if (u.phone) phoneSet.add(u.phone); });

  let newCount = 0, updatedCount = 0, skippedCount = 0;
  const batchNames = new Set();

  for (const p of providers) {
    if (!p?.businessName || !p?.phone) { skippedCount++; continue; }
    const norm = normalizeName(p.businessName);

    if (batchNames.has(norm) || phoneSet.has(p.phone)) { skippedCount++; continue; }

    const ex = nameMap.get(norm);
    if (ex) {
      // Update existing
      const upd = {};
      if (!ex.phone && p.phone) upd.phone = p.phone;
      if ((!ex.parish || ex.parish === 'Kingston') && p.parish && p.parish !== 'Kingston') upd.parish = p.parish;
      if (Object.keys(upd).length > 0) {
        try {
          await prisma.unclaimedProvider.update({ where: { id: ex.id }, data: upd });
          if (ex.claimedByUserId) {
            await prisma.user.update({ where: { id: ex.claimedByUserId }, data: upd }).catch(()=>{});
            if (upd.parish) await prisma.service.updateMany({ where: { providerId: ex.claimedByUserId }, data: { parish: upd.parish } }).catch(()=>{});
          }
          updatedCount++;
        } catch { skippedCount++; }
      } else { skippedCount++; }
      continue;
    }

    batchNames.add(norm);
    phoneSet.add(p.phone);

    try {
      const code = generateClaimCode();
      const email = `provider-${crypto.randomBytes(4).toString('hex')}@unclaimed.jobsyja.com`;

      const unc = await prisma.unclaimedProvider.create({
        data: { businessName: p.businessName, phone: p.phone, email: p.email, category: p.category, categoryId: p.categoryId, parish: p.parish, address: p.address, description: p.description, sourceUrl: p.sourceUrl, sourcePlatform: p.sourcePlatform, isClaimed: true, claimCode: code },
      });
      const user = await prisma.user.create({
        data: { email, passwordHash: randomPwHash(), name: p.businessName, role: 'PROVIDER', phone: p.phone, parish: p.parish, bio: p.description, isEmailVerified: false, isActive: true, verificationStatus: 'PENDING' },
      });
      await prisma.unclaimedProvider.update({ where: { id: unc.id }, data: { claimedByUserId: user.id } });
      await prisma.service.create({
        data: { title: `${p.category} Services`, description: p.description || `${p.category} by ${p.businessName} in ${p.parish}. Contact for pricing.`, providerId: user.id, categoryId: p.categoryId || CATEGORY_IDS['Other'], priceMin: 0, priceCurrency: 'JMD', priceUnit: 'per_service', parish: p.parish, tags: [p.category.toLowerCase()], isActive: true, isFeatured: false },
      });
      newCount++;
      if (newCount % 50 === 0) console.log(`  ${newCount} new imported...`);
    } catch { skippedCount++; }
  }

  return { newCount, updatedCount, skippedCount };
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  console.log('====== JOBSY MEGA SCRAPER ======');
  console.log('');

  const ji = await scrapeJamaicaIndex();
  const waj = await scrapeWorkandJam();
  const gojep = await scrapeGOJEP();

  const all = [...ji, ...waj, ...gojep];
  console.log('');
  console.log(`Total scraped: ${all.length} (JI:${ji.length} WAJ:${waj.length} GOJEP:${gojep.length})`);

  const result = await importAll(all);
  console.log('');
  console.log('=== RESULTS ===');
  console.log(`  New: ${result.newCount}`);
  console.log(`  Updated: ${result.updatedCount}`);
  console.log(`  Skipped: ${result.skippedCount}`);

  const total = await prisma.service.count({ where: { isActive: true, deletedAt: null } });
  const withPhone = await prisma.user.count({ where: { role: 'PROVIDER', phone: { not: null } } });
  const parishes = await prisma.service.groupBy({ by: ['parish'], where: { isActive: true }, _count: true, orderBy: { _count: { parish: 'desc' } } });

  console.log('');
  console.log(`=== FINAL: ${total} services, ${withPhone} with phone ===`);
  parishes.forEach(p => console.log(`  ${p.parish}: ${p._count}`));
}

main().catch(err => { console.error('Failed:', err); process.exit(1); }).finally(() => prisma.$disconnect());
