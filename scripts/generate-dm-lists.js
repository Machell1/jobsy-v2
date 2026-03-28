#!/usr/bin/env node

/**
 * Generate DM Lists for Social Media Outreach
 *
 * Reads outreach-data.json and generates CSV files grouped by source platform.
 * Each CSV contains: businessName, claimCode, parish, category, contact info
 *
 * Also generates a DM template message for each platform.
 */

const fs = require('fs');
const path = require('path');

function toCsv(rows, headers) {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => {
      const val = row[h] || '';
      return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(','));
  }
  return lines.join('\n');
}

async function main() {
  const dataPath = path.join(__dirname, 'outreach-data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('ERROR: outreach-data.json not found. Run migrate-unclaimed-to-services.js first.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const outDir = path.join(__dirname, 'dm-lists');
  fs.mkdirSync(outDir, { recursive: true });

  // Group by source platform
  const groups = {};
  for (const d of data) {
    const platform = (d.sourcePlatform || 'unknown').toLowerCase();
    if (!groups[platform]) groups[platform] = [];
    groups[platform].push(d);
  }

  const headers = ['businessName', 'claimCode', 'parish', 'category', 'email', 'phone', 'sourceUrl'];

  console.log('=== Generate DM Lists ===');
  console.log('');

  for (const [platform, providers] of Object.entries(groups).sort((a, b) => b[1].length - a[1].length)) {
    const filename = `dm-${platform.replace(/[^a-z0-9]/g, '-')}.csv`;
    const filepath = path.join(outDir, filename);
    fs.writeFileSync(filepath, toCsv(providers, headers));
    console.log(`  ${filename}: ${providers.length} providers`);
  }

  // Generate all-providers master list
  fs.writeFileSync(path.join(outDir, 'all-providers.csv'), toCsv(data, headers));
  console.log(`  all-providers.csv: ${data.length} total`);

  // Generate DM templates
  const templates = `
=== DM TEMPLATES FOR SOCIAL MEDIA OUTREACH ===

--- FACEBOOK ---
Hi [businessName]! Your business is listed on Jobsy (jobsyja.com), Jamaica's free service marketplace. Customers can already find and contact you. Claim your profile with code [claimCode] at jobsyja.com/claim to manage your listing, add photos, and receive bookings. It's 100% free!

--- INSTAGRAM ---
Hi [businessName]! Your business is live on Jobsy (jobsyja.com) - Jamaica's free service marketplace. Claim your profile with code [claimCode] at jobsyja.com/claim. Edit your listing, add photos, get bookings. Completely free!

--- TIKTOK ---
Hey [businessName]! We listed your business on Jobsy (jobsyja.com) so Jamaican customers can find you. Claim your free profile: go to jobsyja.com/claim and enter code [claimCode]. No fees, no catch!

--- LINKEDIN ---
Dear [businessName], Your business has been listed on Jobsy (jobsyja.com), Jamaica's service marketplace. We're connecting Jamaican service providers with customers across all 14 parishes. Claim your free profile using code [claimCode] at jobsyja.com/claim to manage your listing and receive booking requests.

--- TWITTER/X ---
Hey @[handle]! Your biz is on @JobsyJA - Jamaica's free service marketplace. Claim your profile at jobsyja.com/claim with code [claimCode]. Free forever!

--- WHATSAPP ---
Hi [businessName]! This is Jobsy (jobsyja.com), Jamaica's service marketplace. Your business is already listed and customers can find you. To take control of your profile, go to jobsyja.com/claim and enter your claim code: [claimCode]. It's completely free - no fees or commissions. Reply STOP to opt out.
`;

  fs.writeFileSync(path.join(outDir, 'dm-templates.txt'), templates.trim());
  console.log('  dm-templates.txt: DM templates for all platforms');

  console.log('');
  console.log(`All files saved to: ${outDir}/`);
}

main().catch(err => { console.error('Failed:', err); process.exit(1); });
