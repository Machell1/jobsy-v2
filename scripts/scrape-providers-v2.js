#!/usr/bin/env node

/**
 * Jobsy FindYello Scraper V2 - Profile-Level Contact Extraction
 *
 * Two-phase scraper:
 *   Phase 1: Collect all profile URLs from category listing pages
 *   Phase 2: Visit each profile page to extract full contact details
 *   Phase 3: Deduplicate, import new providers, update existing ones
 *
 * Usage: node scripts/scrape-providers-v2.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { PrismaClient } = require('../packages/database/dist/index.js');

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:TRmnVNmXLMsuAkFNJcxErHnzCENpgTFL@switchback.proxy.rlwy.net:35094/railway',
});

// ─── Category Map ────────────────────────────────────────────
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

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

// ─── Utilities ───────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Decode Cloudflare email protection (data-cfemail encoded strings)
function decodeCfEmail(encoded) {
  try {
    const key = parseInt(encoded.substr(0, 2), 16);
    let email = '';
    for (let i = 2; i < encoded.length; i += 2) {
      email += String.fromCharCode(parseInt(encoded.substr(i, 2), 16) ^ key);
    }
    return email;
  } catch { return null; }
}

// Extract parish from various text formats
const PARISH_LIST = [
  'Kingston', 'St. Andrew', 'St. Thomas', 'Portland', 'St. Mary',
  'St. Ann', 'Trelawny', 'St. James', 'Hanover', 'Westmoreland',
  'St. Elizabeth', 'Manchester', 'Clarendon', 'St. Catherine',
];

function extractParishFromText(text) {
  if (!text) return null;
  for (const p of PARISH_LIST) {
    if (text.includes(p)) return p;
  }
  // Common area to parish mappings
  const areaMap = {
    'Montego Bay': 'St. James', 'MoBay': 'St. James',
    'Mandeville': 'Manchester', 'May Pen': 'Clarendon',
    'Spanish Town': 'St. Catherine', 'Portmore': 'St. Catherine',
    'Old Harbour': 'St. Catherine', 'Linstead': 'St. Catherine',
    'Ocho Rios': 'St. Ann', 'Runaway Bay': 'St. Ann', 'Brown\'s Town': 'St. Ann',
    'Port Antonio': 'Portland', 'Buff Bay': 'Portland',
    'Morant Bay': 'St. Thomas', 'Yallahs': 'St. Thomas',
    'Negril': 'Westmoreland', 'Savanna-la-Mar': 'Westmoreland',
    'Black River': 'St. Elizabeth', 'Santa Cruz': 'St. Elizabeth', 'Junction': 'St. Elizabeth',
    'Falmouth': 'Trelawny', 'Lucea': 'Hanover', 'Green Island': 'Hanover',
    'Port Maria': 'St. Mary', 'Annotto Bay': 'St. Mary', 'Highgate': 'St. Mary',
    'Half Way Tree': 'St. Andrew', 'New Kingston': 'St. Andrew', 'Liguanea': 'St. Andrew',
    'Cross Roads': 'St. Andrew', 'Papine': 'St. Andrew', 'Stony Hill': 'St. Andrew',
    'Constant Spring': 'St. Andrew', 'Red Hills': 'St. Andrew',
    'Hope Road': 'St. Andrew', 'Knutsford': 'St. Andrew',
  };
  for (const [area, parish] of Object.entries(areaMap)) {
    if (text.includes(area)) return parish;
  }
  // Check for "Kingston X" patterns (Kingston 1-20 are Kingston parish)
  if (/Kingston\s+\d/i.test(text)) return 'Kingston';
  return null;
}

function normalizeName(name) {
  return name.toLowerCase()
    .replace(/\b(ltd|limited|inc|incorporated|co|company|corp|llc|services?|servs?)\b/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Phase 1: Collect Profile URLs ──────────────────────────

async function collectProfileUrls(slug) {
  const urls = new Set();
  let page = 1;
  const maxPages = 20;

  while (page <= maxPages) {
    const url = page === 1
      ? `https://www.findyello.com/jamaica/${slug}/`
      : `https://www.findyello.com/jamaica/${slug}/pageno=${page}`;

    try {
      const { data: html } = await axios.get(url, { timeout: 20000, headers: HEADERS });
      const $ = cheerio.load(html);

      let found = 0;
      $('a[href*="/profile/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        const fullUrl = href.startsWith('http') ? href : 'https://www.findyello.com' + href;
        // Only include actual profile pages, not anchors within them
        if (fullUrl.includes('/profile/') && !fullUrl.includes('#')) {
          urls.add(fullUrl.split('?')[0]); // strip query params
          found++;
        }
      });

      if (found < 10) break; // no more pages
      page++;
      await sleep(2000 + Math.random() * 1000);
    } catch (err) {
      if (err.response?.status === 502 || err.response?.status === 503) {
        // Rate limited - wait and retry once
        await sleep(10000);
        try {
          const { data: html } = await axios.get(url, { timeout: 20000, headers: HEADERS });
          const $ = cheerio.load(html);
          $('a[href*="/profile/"]').each((_, el) => {
            const href = $(el).attr('href');
            if (!href) return;
            const fullUrl = href.startsWith('http') ? href : 'https://www.findyello.com' + href;
            if (fullUrl.includes('/profile/') && !fullUrl.includes('#')) {
              urls.add(fullUrl.split('?')[0]);
            }
          });
        } catch { /* give up on this page */ }
      }
      break; // move to next category on other errors
    }
  }

  return urls;
}

// ─── Phase 2: Scrape Individual Profile Page ────────────────

async function scrapeProfile(profileUrl) {
  try {
    const { data: html } = await axios.get(profileUrl, { timeout: 20000, headers: HEADERS });
    const $ = cheerio.load(html);

    // Business name from title: "Name - Category in City, Parish | FindYello"
    const title = $('title').text() || '';
    const businessName = title.split(' - ')[0].trim();
    if (!businessName || businessName.length < 3) return null;

    // Phone from tel: link
    const phoneEl = $('a[href^="tel:"]').first();
    const phone = phoneEl.length ? phoneEl.attr('href').replace('tel:', '').trim() : null;

    // Email: try multiple extraction methods
    let email = null;
    // Method 1: Standard mailto link
    const emailEl = $('a[href^="mailto:"]').first();
    if (emailEl.length) {
      email = emailEl.attr('href').replace('mailto:', '').trim();
    }
    // Method 2: Cloudflare email protection (data-cfemail encoded)
    if (!email) {
      const cfEmailEl = $('span.__cf_email__, [data-cfemail]').first();
      if (cfEmailEl.length) {
        const encoded = cfEmailEl.attr('data-cfemail');
        if (encoded) email = decodeCfEmail(encoded);
      }
    }
    // Method 3: Email protection link with /cdn-cgi/l/email-protection
    if (!email) {
      const cfLinkEl = $('a[href*="email-protection"]').first();
      if (cfLinkEl.length) {
        const cfSpan = cfLinkEl.find('[data-cfemail]');
        if (cfSpan.length) {
          email = decodeCfEmail(cfSpan.attr('data-cfemail'));
        }
      }
    }
    // Method 4: Look for email class
    if (!email) {
      const emailClassEl = $('a.email-address, .email-address').first();
      if (emailClassEl.length) {
        const cfSpan = emailClassEl.find('[data-cfemail]');
        if (cfSpan.length) {
          email = decodeCfEmail(cfSpan.attr('data-cfemail'));
        }
      }
    }

    // Parish from title: "... in City, Parish | FindYello"
    const titleMatch = title.match(/in\s+([^,]+),\s*(\S[^|]+)\s*\|/);
    const city = titleMatch ? titleMatch[1].trim() : null;
    let parish = titleMatch ? titleMatch[2].trim() : null;
    // Validate parish is a real Jamaica parish
    if (parish && !PARISH_LIST.includes(parish)) {
      // Try extracting from full title + address text
      parish = extractParishFromText(title) || extractParishFromText(city) || null;
    }
    // If still no parish, try from address/body text
    if (!parish) {
      const bodyText = $.root().text();
      parish = extractParishFromText(bodyText.slice(0, 2000));
    }

    // Address from itemprop or contact section
    let address = null;
    const addrEl = $('[itemprop="address"]');
    if (addrEl.length) {
      address = addrEl.text().replace(/\s+/g, ' ').trim();
      // Remove the business name from address if it's prepended
      if (address.startsWith(businessName)) {
        address = address.slice(businessName.length).trim();
      }
      // Remove phone/email from address text
      if (phone) address = address.replace(phone.replace('+1', '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'), '').trim();
      if (email) address = address.replace(email, '').trim();
      address = address.replace(/\s+/g, ' ').trim().slice(0, 200);
    }

    // Description from body text between "General Information" and "Products"/"Services"/"Payment"
    let description = null;
    const bodyText = $.root().text();
    const giIdx = bodyText.indexOf('General Information');
    if (giIdx > -1) {
      const afterGI = bodyText.substring(giIdx + 19);
      const endMarkers = ['Products', 'Brands', 'Payment', 'Features', 'Slogan', 'Services\n', 'Send a Message'];
      let endIdx = afterGI.length;
      for (const marker of endMarkers) {
        const idx = afterGI.indexOf(marker);
        if (idx > 0 && idx < endIdx) endIdx = idx;
      }
      description = afterGI.substring(0, endIdx).replace(/\s+/g, ' ').trim().slice(0, 500);
    }

    // Image
    let imageUrl = null;
    const imgEl = $('img[src*="cloudinary"], img[src*="yello"], .store-image img, .profile-photo img').first();
    if (imgEl.length) {
      const src = imgEl.attr('src') || imgEl.attr('data-src');
      if (src && !src.includes('placeholder') && !src.includes('default-store') && !src.includes('no-image')) {
        imageUrl = src.startsWith('//') ? 'https:' + src : src;
      }
    }

    return {
      businessName,
      phone,
      email,
      parish: parish || null,
      city,
      address: address || null,
      description: description || null,
      imageUrl,
      sourceUrl: profileUrl,
      sourcePlatform: 'findyello',
    };
  } catch (err) {
    if (err.response?.status === 502 || err.response?.status === 503) {
      // Retry once after backoff
      await sleep(8000);
      try {
        const { data: html } = await axios.get(profileUrl, { timeout: 20000, headers: HEADERS });
        const $ = cheerio.load(html);
        const title = $('title').text() || '';
        const businessName = title.split(' - ')[0].trim();
        const phoneEl = $('a[href^="tel:"]').first();
        const phone = phoneEl.length ? phoneEl.attr('href').replace('tel:', '').trim() : null;
        // Try all email extraction methods
        let email = null;
        const emailEl = $('a[href^="mailto:"]').first();
        if (emailEl.length) email = emailEl.attr('href').replace('mailto:', '').trim();
        if (!email) {
          const cfEl = $('[data-cfemail]').first();
          if (cfEl.length) email = decodeCfEmail(cfEl.attr('data-cfemail'));
        }
        const titleMatch = title.match(/in\s+([^,]+),\s*(\S[^|]+)\s*\|/);
        let parish = titleMatch ? titleMatch[2].trim() : null;
        if (parish && !PARISH_LIST.includes(parish)) parish = extractParishFromText(title);
        if (businessName && businessName.length >= 3) {
          return { businessName, phone, email, parish, city: titleMatch?.[1]?.trim(), address: null, description: null, imageUrl: null, sourceUrl: profileUrl, sourcePlatform: 'findyello' };
        }
      } catch { /* give up */ }
    }
    return null;
  }
}

// ─── Phase 3: Import / Update ───────────────────────────────

async function importAndUpdate(providers) {
  // Load existing for dedup
  const existing = await prisma.unclaimedProvider.findMany({
    select: { id: true, businessName: true, phone: true, email: true, parish: true, address: true, description: true, claimedByUserId: true },
  });
  const nameMap = new Map();
  for (const e of existing) {
    nameMap.set(normalizeName(e.businessName), e);
  }

  let newImported = 0;
  let updated = 0;
  let skipped = 0;
  let usersUpdated = 0;

  for (const p of providers) {
    if (!p || !p.businessName) { skipped++; continue; }

    const normalized = normalizeName(p.businessName);
    const existingRecord = nameMap.get(normalized);

    if (existingRecord) {
      // UPDATE existing record with missing data
      const updates = {};
      if (!existingRecord.phone && p.phone) updates.phone = p.phone;
      if (!existingRecord.email && p.email) updates.email = p.email;
      if ((!existingRecord.parish || existingRecord.parish === 'Kingston') && p.parish && p.parish !== 'Kingston') {
        updates.parish = p.parish;
      }
      if (!existingRecord.address && p.address) updates.address = p.address;
      if (!existingRecord.description && p.description) updates.description = p.description;

      if (Object.keys(updates).length > 0) {
        try {
          await prisma.unclaimedProvider.update({
            where: { id: existingRecord.id },
            data: updates,
          });

          // Also update the linked User account if it exists
          if (existingRecord.claimedByUserId) {
            const userUpdates = {};
            if (updates.phone) userUpdates.phone = updates.phone;
            if (updates.email && !updates.email.includes('@unclaimed.')) {
              // Don't overwrite real email with scraped one - only fill nulls
            }
            if (updates.parish) userUpdates.parish = updates.parish;
            if (Object.keys(userUpdates).length > 0) {
              await prisma.user.update({
                where: { id: existingRecord.claimedByUserId },
                data: userUpdates,
              });
              // Also update service parish
              if (userUpdates.parish) {
                await prisma.service.updateMany({
                  where: { providerId: existingRecord.claimedByUserId },
                  data: { parish: userUpdates.parish },
                });
              }
              usersUpdated++;
            }
          }

          updated++;
        } catch { skipped++; }
      } else {
        skipped++;
      }
    } else {
      // CREATE new provider
      const catInfo = Object.values(CATEGORY_MAP).find(c => c.name === p.category) || { name: 'Other', id: '218d9f58-9eb1-495e-a8d3-b8ff4968b556' };
      try {
        await prisma.unclaimedProvider.create({
          data: {
            businessName: p.businessName,
            phone: p.phone,
            email: p.email,
            category: p.category || catInfo.name,
            categoryId: p.categoryId || catInfo.id,
            parish: p.parish || 'Kingston',
            address: p.address,
            description: p.description,
            imageUrl: p.imageUrl,
            sourceUrl: p.sourceUrl,
            sourcePlatform: 'findyello',
          },
        });
        nameMap.set(normalized, { businessName: p.businessName }); // prevent dupes within batch
        newImported++;
      } catch { skipped++; }
    }
  }

  return { newImported, updated, skipped, usersUpdated };
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  console.log('=== Jobsy FindYello Scraper V2 - Profile-Level Extraction ===');
  console.log('');

  const slugs = Object.keys(CATEGORY_MAP);

  // ── Phase 1: Collect all profile URLs ──
  console.log(`Phase 1: Collecting profile URLs from ${slugs.length} categories...`);
  console.log('');

  const allProfileUrls = new Map(); // url -> { category, categoryId }

  for (const slug of slugs) {
    const catInfo = CATEGORY_MAP[slug];
    process.stdout.write(`  [${slug}] `);

    const urls = await collectProfileUrls(slug);
    let newCount = 0;
    for (const url of urls) {
      if (!allProfileUrls.has(url)) {
        allProfileUrls.set(url, { category: catInfo.name, categoryId: catInfo.id });
        newCount++;
      }
    }
    console.log(`${urls.size} found (${newCount} new)`);
    await sleep(3000 + Math.random() * 2000);
  }

  console.log('');
  console.log(`Total unique profile URLs: ${allProfileUrls.size}`);
  console.log('');

  // ── Phase 2: Visit each profile page ──
  console.log('Phase 2: Scraping individual profile pages...');
  console.log('');

  const allProviders = [];
  let profileIdx = 0;
  const totalProfiles = allProfileUrls.size;
  let successCount = 0;
  let failCount = 0;

  for (const [url, meta] of allProfileUrls) {
    profileIdx++;
    if (profileIdx % 25 === 0) {
      console.log(`  Progress: ${profileIdx}/${totalProfiles} profiles (${successCount} success, ${failCount} failed)`);
    }

    const provider = await scrapeProfile(url);
    if (provider) {
      provider.category = meta.category;
      provider.categoryId = meta.categoryId;
      allProviders.push(provider);
      successCount++;
    } else {
      failCount++;
    }

    await sleep(1500 + Math.random() * 1000);
  }

  console.log(`  Final: ${profileIdx}/${totalProfiles} profiles scraped`);
  console.log(`  Success: ${successCount}, Failed: ${failCount}`);
  console.log('');

  // Stats
  const withPhone = allProviders.filter(p => p.phone).length;
  const withEmail = allProviders.filter(p => p.email).length;
  const withParish = allProviders.filter(p => p.parish && p.parish !== 'Kingston').length;
  console.log(`  With phone: ${withPhone}/${allProviders.length} (${(withPhone/allProviders.length*100).toFixed(1)}%)`);
  console.log(`  With email: ${withEmail}/${allProviders.length} (${(withEmail/allProviders.length*100).toFixed(1)}%)`);
  console.log(`  With non-Kingston parish: ${withParish}/${allProviders.length}`);
  console.log('');

  // Parish distribution
  const parishCounts = {};
  allProviders.forEach(p => {
    const parish = p.parish || 'Unknown';
    parishCounts[parish] = (parishCounts[parish] || 0) + 1;
  });
  console.log('  Parish distribution:');
  Object.entries(parishCounts).sort((a, b) => b[1] - a[1]).forEach(([parish, count]) => {
    console.log(`    ${parish}: ${count}`);
  });
  console.log('');

  // ── Phase 3: Import and update ──
  console.log('Phase 3: Importing new providers and updating existing records...');

  const result = await importAndUpdate(allProviders);
  console.log(`  New providers imported: ${result.newImported}`);
  console.log(`  Existing providers updated: ${result.updated}`);
  console.log(`  Users/services updated: ${result.usersUpdated}`);
  console.log(`  Skipped: ${result.skipped}`);
  console.log('');

  // Final database stats
  const totalProviders = await prisma.unclaimedProvider.count();
  const providersWithPhone = await prisma.unclaimedProvider.count({ where: { phone: { not: null } } });
  const providersWithEmail = await prisma.unclaimedProvider.count({ where: { email: { not: null } } });
  const usersWithPhone = await prisma.user.count({ where: { phone: { not: null }, role: 'PROVIDER' } });

  console.log('=== Final Database Stats ===');
  console.log(`  Total unclaimed providers: ${totalProviders}`);
  console.log(`  With phone number: ${providersWithPhone} (${(providersWithPhone/totalProviders*100).toFixed(1)}%)`);
  console.log(`  With email: ${providersWithEmail} (${(providersWithEmail/totalProviders*100).toFixed(1)}%)`);
  console.log(`  Provider users with phone: ${usersWithPhone}`);
}

main()
  .catch(err => { console.error('Scraper failed:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
