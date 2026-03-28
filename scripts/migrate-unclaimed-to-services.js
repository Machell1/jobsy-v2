#!/usr/bin/env node

/**
 * Migrate Unclaimed Providers to Real Users + Services
 *
 * For each unclaimed provider:
 * 1. Creates a User account (PROVIDER, PENDING verification)
 * 2. Creates Service listing(s) from their unclaimed services (or default from category)
 * 3. Generates unique 8-char claim code
 * 4. Links UnclaimedProvider to the new User
 *
 * Outputs: outreach-data.json with emails, codes, and source platforms for email/DM campaigns
 */

const { PrismaClient } = require('../packages/database/dist/index.js');
const crypto = require('crypto');
const fs = require('fs');

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:TRmnVNmXLMsuAkFNJcxErHnzCENpgTFL@switchback.proxy.rlwy.net:35094/railway',
});

// Generate unique 8-char alphanumeric code
function generateClaimCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 chars hex
}

// Generate a random unusable password hash
function randomPasswordHash() {
  return '$2a$12$' + crypto.randomBytes(30).toString('base64').slice(0, 53);
}

async function main() {
  console.log('=== Migrate Unclaimed Providers to Real Users + Services ===');
  console.log('');

  // Get all unclaimed providers that haven't been migrated yet
  const unclaimed = await prisma.unclaimedProvider.findMany({
    where: { isClaimed: false },
    include: { services: true },
  });

  console.log(`Found ${unclaimed.length} unclaimed providers to migrate`);
  console.log('');

  // Track used claim codes to ensure uniqueness
  const usedCodes = new Set();
  // Track used emails to handle providers without email
  const usedEmails = new Set();

  // Load existing user emails
  const existingUsers = await prisma.user.findMany({ select: { email: true } });
  existingUsers.forEach(u => usedEmails.add(u.email.toLowerCase()));

  const outreachData = [];
  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < unclaimed.length; i++) {
    const provider = unclaimed[i];

    try {
      // Generate unique claim code
      let claimCode;
      do {
        claimCode = generateClaimCode();
      } while (usedCodes.has(claimCode));
      usedCodes.add(claimCode);

      // Determine email for the user account
      let email = provider.email?.toLowerCase().trim();
      if (!email || usedEmails.has(email)) {
        // Generate placeholder email for providers without one
        email = `provider-${provider.id.slice(0, 8)}@unclaimed.jobsyja.com`;
      }

      // Skip if this placeholder email is somehow taken too
      if (usedEmails.has(email)) {
        skipped++;
        continue;
      }
      usedEmails.add(email);

      // Create User account
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: randomPasswordHash(),
          name: provider.contactName || provider.businessName,
          role: 'PROVIDER',
          phone: provider.phone,
          parish: provider.parish,
          bio: provider.description,
          isEmailVerified: false,
          isActive: true,
          verificationStatus: 'PENDING',
        },
      });

      // Create Service listing(s)
      let servicesCreated = 0;

      if (provider.services.length > 0) {
        // Convert unclaimed services to real services
        for (const svc of provider.services) {
          await prisma.service.create({
            data: {
              title: svc.title,
              description: svc.description || `${svc.title} by ${provider.businessName} in ${provider.parish}`,
              providerId: user.id,
              categoryId: svc.categoryId || provider.categoryId || '218d9f58-9eb1-495e-a8d3-b8ff4968b556', // fallback to 'Other'
              priceMin: svc.priceMin || 0,
              priceMax: svc.priceMax,
              priceCurrency: 'JMD',
              priceUnit: 'per_service',
              parish: svc.parish || provider.parish,
              tags: svc.tags || [],
              isActive: true,
              isFeatured: false,
            },
          });
          servicesCreated++;
        }
      } else {
        // Create a default service from the provider's category
        await prisma.service.create({
          data: {
            title: `${provider.category} Services`,
            description: provider.description || `${provider.category} services by ${provider.businessName} in ${provider.parish}. Contact us for pricing and availability.`,
            providerId: user.id,
            categoryId: provider.categoryId || '218d9f58-9eb1-495e-a8d3-b8ff4968b556',
            priceMin: 0,
            priceCurrency: 'JMD',
            priceUnit: 'per_service',
            parish: provider.parish,
            tags: [provider.category.toLowerCase()],
            isActive: true,
            isFeatured: false,
          },
        });
        servicesCreated = 1;
      }

      // Update UnclaimedProvider: mark as claimed, store code
      await prisma.unclaimedProvider.update({
        where: { id: provider.id },
        data: {
          isClaimed: true,
          claimedByUserId: user.id,
          claimCode: claimCode,
        },
      });

      // Track for outreach
      outreachData.push({
        businessName: provider.businessName,
        contactName: provider.contactName,
        email: provider.email, // original email (not placeholder)
        phone: provider.phone,
        parish: provider.parish,
        category: provider.category,
        claimCode,
        sourcePlatform: provider.sourcePlatform,
        sourceUrl: provider.sourceUrl,
        userId: user.id,
        servicesCreated,
      });

      migrated++;

      if (migrated % 50 === 0) {
        console.log(`  Progress: ${migrated}/${unclaimed.length} migrated`);
      }
    } catch (err) {
      errors++;
      console.error(`  Error migrating "${provider.businessName}": ${err.message}`);
    }
  }

  // Save outreach data
  const outreachPath = 'scripts/outreach-data.json';
  fs.writeFileSync(outreachPath, JSON.stringify(outreachData, null, 2));

  // Stats
  const totalServices = await prisma.service.count({ where: { isActive: true, deletedAt: null } });
  const totalUsers = await prisma.user.count();

  console.log('');
  console.log('=== Migration Complete ===');
  console.log(`  Migrated: ${migrated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total users: ${totalUsers}`);
  console.log(`  Total active services: ${totalServices}`);
  console.log(`  Outreach data saved to: ${outreachPath}`);
  console.log('');

  // Summary by source platform
  const bySource = {};
  const withEmail = outreachData.filter(d => d.email).length;
  const withPhone = outreachData.filter(d => d.phone).length;
  outreachData.forEach(d => {
    const src = d.sourcePlatform || 'unknown';
    bySource[src] = (bySource[src] || 0) + 1;
  });

  console.log('  By source platform:');
  Object.entries(bySource).sort((a, b) => b[1] - a[1]).forEach(([src, count]) => {
    console.log(`    ${src}: ${count}`);
  });
  console.log(`  With email: ${withEmail}`);
  console.log(`  With phone: ${withPhone}`);
}

main()
  .catch(err => { console.error('Migration failed:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
