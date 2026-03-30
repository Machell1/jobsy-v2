#!/usr/bin/env node

/**
 * Cleanup No-Contact Providers
 *
 * Deletes all PROVIDER users who have no phone AND no real email.
 * These providers can't be contacted, can't claim their account,
 * and make the platform look untrustworthy.
 *
 * For each deleted user:
 *   1. Delete their services
 *   2. Delete their refresh tokens
 *   3. Delete the user
 *   4. Reset the linked UnclaimedProvider (unclaim it)
 */

const { PrismaClient } = require('../packages/database/dist/index.js');

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:TRmnVNmXLMsuAkFNJcxErHnzCENpgTFL@switchback.proxy.rlwy.net:35094/railway',
});

async function main() {
  console.log('=== Cleanup No-Contact Providers ===');
  console.log('');

  // Find provider users with no phone AND no real email (only placeholder @unclaimed. email)
  const noContactUsers = await prisma.user.findMany({
    where: {
      role: 'PROVIDER',
      phone: null,
      email: { contains: '@unclaimed.' },
    },
    select: { id: true, name: true, email: true, phone: true },
  });

  console.log(`Found ${noContactUsers.length} providers with no contact info`);
  console.log('');

  // Keep the 3 original seed providers (Kemar, Shanelle, Devon) regardless
  const protectedEmails = ['kemar@jobsyja.com', 'shanelle@jobsyja.com', 'devon@jobsyja.com', 'admin@jobsyja.com', 'williamsmachell@gmail.com'];
  const toDelete = noContactUsers.filter(u => !protectedEmails.includes(u.email));

  console.log(`Will delete ${toDelete.length} providers (${noContactUsers.length - toDelete.length} protected)`);
  console.log('');

  let deleted = 0;
  let errors = 0;

  for (const user of toDelete) {
    try {
      // Delete services
      await prisma.service.deleteMany({ where: { providerId: user.id } });

      // Delete refresh tokens
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

      // Delete email verifications
      await prisma.emailVerification.deleteMany({ where: { userId: user.id } });

      // Reset linked UnclaimedProvider
      await prisma.unclaimedProvider.updateMany({
        where: { claimedByUserId: user.id },
        data: { isClaimed: false, claimedByUserId: null, claimCode: null, claimedAt: null },
      });

      // Delete the user
      await prisma.user.delete({ where: { id: user.id } });

      deleted++;
      if (deleted % 50 === 0) console.log(`  Progress: ${deleted}/${toDelete.length}`);
    } catch (err) {
      errors++;
    }
  }

  console.log('');
  console.log('=== Cleanup Results ===');
  console.log(`  Deleted: ${deleted} providers`);
  console.log(`  Errors: ${errors}`);

  // Final stats
  const totalUsers = await prisma.user.count({ where: { role: 'PROVIDER' } });
  const totalServices = await prisma.service.count({ where: { isActive: true, deletedAt: null } });
  const usersWithPhone = await prisma.user.count({ where: { role: 'PROVIDER', phone: { not: null } } });

  console.log('');
  console.log('=== Final Stats ===');
  console.log(`  Provider users remaining: ${totalUsers}`);
  console.log(`  Active services remaining: ${totalServices}`);
  console.log(`  Providers with phone: ${usersWithPhone}`);

  // Parish distribution of remaining services
  const parishes = await prisma.service.groupBy({
    by: ['parish'],
    where: { isActive: true, deletedAt: null },
    _count: true,
    orderBy: { _count: { parish: 'desc' } },
  });
  console.log('');
  console.log('  Parish distribution:');
  parishes.forEach(p => console.log(`    ${p.parish}: ${p._count}`));
}

main()
  .catch(err => { console.error('Cleanup failed:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
