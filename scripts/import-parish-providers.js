#!/usr/bin/env node

/**
 * Import Parish-Specific Providers
 *
 * Imports providers found via web search for underrepresented parishes.
 * All providers have verified phone numbers.
 * After import, migrates them to User + Service records.
 */

const { PrismaClient } = require('../packages/database/dist/index.js');
const crypto = require('crypto');

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:TRmnVNmXLMsuAkFNJcxErHnzCENpgTFL@switchback.proxy.rlwy.net:35094/railway',
});

const CATS = {
  'Plumbing': '303b101e-6984-48ed-9d60-043669d69364',
  'Electrical': 'de8cac79-adf5-4b74-9d2c-2ac22b141093',
  'Home Cleaning': 'b8b17ede-9017-44a4-96b0-82496ca5fd11',
  'Construction': 'b2936cd0-a682-43dc-b151-e55e89fc2cde',
  'Catering': '2306bf73-7e1a-4937-beba-fdc039c01190',
  'Other': '218d9f58-9eb1-495e-a8d3-b8ff4968b556',
};

const providers = [
  // ST. THOMAS (16 with phone)
  { businessName: "Vernon Bartlett Electrical Services", phone: "+18768532118", parish: "St. Thomas", category: "Electrical", description: "Licensed electrician with over 37 years experience in residential, commercial, and industrial work" },
  { businessName: "Dwight Douglas Electrical", phone: "+18762993539", parish: "St. Thomas", category: "Electrical", description: "Licensed electrician with 39+ years experience, offers solar system and camera installation" },
  { businessName: "Derrick Hyatt Electrical", phone: "+18767061259", parish: "St. Thomas", category: "Electrical", description: "Licensed electrician with 40+ years experience in residential and commercial services" },
  { businessName: "John Beckford Electrical", phone: "+18768412803", parish: "St. Thomas", category: "Electrical", description: "Licensed electrician serving St. Thomas parish" },
  { businessName: "Shawn Crosdale Electrical", phone: "+18765848654", parish: "St. Thomas", category: "Electrical", description: "Licensed electrician serving St. Thomas parish" },
  { businessName: "Clebert Hudson Electrical", phone: "+18768619890", parish: "St. Thomas", category: "Electrical", description: "Licensed electrician serving St. Thomas parish" },
  { businessName: "Uriel McKenzie Electrical", phone: "+18764285778", parish: "St. Thomas", category: "Electrical", description: "Licensed electrician serving St. Thomas parish" },
  { businessName: "Hopeton Morris Electrical", phone: "+18765351534", parish: "St. Thomas", category: "Electrical", description: "Licensed electrician serving St. Thomas parish" },
  { businessName: "Ferdinand O'Connor Electrical", phone: "+18763834742", parish: "St. Thomas", category: "Electrical", description: "Licensed electrician serving St. Thomas parish" },
  { businessName: "Sanjay Parseley Electrical", phone: "+18763236827", parish: "St. Thomas", category: "Electrical", description: "Licensed electrician serving St. Thomas parish" },
  { businessName: "Magnus Phillips Electrical", phone: "+18763719347", parish: "St. Thomas", category: "Electrical", description: "Licensed electrician serving St. Thomas parish" },
  { businessName: "Raymond Spencer Electrical", phone: "+18763525769", parish: "St. Thomas", category: "Electrical", description: "Licensed electrician serving St. Thomas parish" },
  { businessName: "Delroy Thompson Electrical", phone: "+18765408969", parish: "St. Thomas", category: "Electrical", description: "Licensed electrician serving St. Thomas parish" },
  { businessName: "Kelvin Walker Electrical", phone: "+18768866317", parish: "St. Thomas", category: "Electrical", description: "Licensed electrician serving St. Thomas parish" },
  { businessName: "Richard Morris Electrical", phone: "+18765022191", parish: "St. Thomas", category: "Electrical", description: "Licensed electrician serving St. Thomas parish" },
  { businessName: "Bedward & Bedlets Construction Services", phone: "+18763992243", parish: "St. Thomas", category: "Construction", description: "Building contractor based in Yallahs, St. Thomas" },

  // PORTLAND (5)
  { businessName: "Huell's Solutions Electrical", phone: "+18763449414", parish: "Portland", category: "Electrical", description: "Electrical services provider in Port Antonio, Portland" },
  { businessName: "All Electrical Works Portland", phone: "+18764180045", parish: "Portland", category: "Electrical", description: "Electrical services provider in Port Antonio, Portland" },
  { businessName: "Mr. Gibson Plumbing", phone: "+18764197272", parish: "Portland", category: "Plumbing", description: "Plumbing services in Port Antonio, Portland" },
  { businessName: "Anchovy Hardware & Plumbing", phone: "+18769930069", parish: "Portland", category: "Plumbing", description: "Hardware and plumbing supplies in Port Antonio, Portland" },
  { businessName: "Jamaica Prime Foods Catering", phone: "+18766181544", parish: "Portland", category: "Catering", description: "Catering service covering Portland, St. Mary, St. Ann for corporate, schools, and events" },

  // ST. MARY (3)
  { businessName: "Impeccable Plumbing And Consulting", phone: "+18765336114", parish: "St. Mary", category: "Plumbing", description: "Plumbing services in Galina, St. Mary" },
  { businessName: "Richard Anthony Baker Electrical", phone: "+18768847300", parish: "St. Mary", category: "Electrical", description: "Government-registered electrician serving St. Mary parish" },
  { businessName: "TC Maids 876", phone: "+18769705657", parish: "St. Mary", category: "Home Cleaning", description: "Professional cleaning service covering St. Ann, St. Mary and Trelawny" },

  // TRELAWNY (3)
  { businessName: "Trelawny Aggregates Ltd", phone: "+18764258574", parish: "Trelawny", category: "Construction", description: "Aggregates and construction materials supplier in Rio Bueno, Trelawny" },
  { businessName: "O.W. Construction and Hardware", phone: "+18769541874", parish: "Trelawny", category: "Construction", description: "Construction contractor and hardware supplier in Clark's Town, Trelawny" },
  { businessName: "Stonebrook Manor Construction", phone: "+18766181396", parish: "Trelawny", category: "Construction", description: "Construction services in Florence Hall, Trelawny" },

  // HANOVER (3)
  { businessName: "Nufield Construction and Design", phone: "+18764842777", parish: "Hanover", category: "Construction", description: "Architecture, construction, and contractor services in Hopewell, Hanover" },
  { businessName: "Sheffield Hardware", phone: "+18769562522", parish: "Hanover", category: "Construction", description: "Hardware and construction supplies on Miller's Dr, Lucea, Hanover" },
  { businessName: "Best Choice Hardware Ltd", phone: "+18769562565", parish: "Hanover", category: "Construction", description: "Hardware supplier on Mosley Drive, Lucea, Hanover" },

  // ST. ELIZABETH (7)
  { businessName: "Howard Alexander Electrical", phone: "+18764465429", parish: "St. Elizabeth", category: "Electrical", description: "Licensed electrician with over 30 years experience in residential, commercial and industrial wiring" },
  { businessName: "Mickey Whyte Electrical", phone: "+18765043422", parish: "St. Elizabeth", category: "Electrical", description: "Licensed electrician with over 25 years experience, solar systems and energy audits" },
  { businessName: "Prostar Electrical Construction", phone: "+18768609680", parish: "St. Elizabeth", category: "Electrical", description: "Electrical installations, repairs, maintenance, security cameras at 115 Main Street, Santa Cruz" },
  { businessName: "Intech Electrical Consulting", phone: "+18764862244", parish: "St. Elizabeth", category: "Electrical", description: "Class 3 electrical installation, maintenance, inspection, solar and generator services" },
  { businessName: "Albert Sawyers Electrical", phone: "+18763312106", parish: "St. Elizabeth", category: "Electrical", description: "Licensed electrician serving St. Elizabeth parish" },
  { businessName: "Aldane Lewis Electrical", phone: "+18768871486", parish: "St. Elizabeth", category: "Electrical", description: "Licensed electrician serving St. Elizabeth parish" },
  { businessName: "Brandon Russell Electrical", phone: "+18763654820", parish: "St. Elizabeth", category: "Electrical", description: "Licensed electrician serving St. Elizabeth parish" },

  // WESTMORELAND (3)
  { businessName: "WOC Electrical Jamaica", phone: "+18764224450", parish: "Westmoreland", category: "Electrical", description: "Registered electrician and licensed inspector with 30+ years experience in Bethel Town, Westmoreland" },
  { businessName: "Island Plumbing Jamaica", phone: "+18765073059", parish: "Westmoreland", category: "Plumbing", description: "Plumbing service covering all parishes including Negril and Westmoreland" },
  { businessName: "Westmoreland Hardware & Supplies", phone: "+18769552437", parish: "Westmoreland", category: "Construction", description: "Hardware and building supplies in Savanna-la-Mar, Westmoreland" },
];

function randomPasswordHash() {
  return '$2a$12$' + crypto.randomBytes(30).toString('base64').slice(0, 53);
}

function generateClaimCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

async function main() {
  console.log('=== Import Parish-Specific Providers ===');
  console.log(`${providers.length} providers to import`);
  console.log('');

  const existingNames = new Set();
  const existing = await prisma.user.findMany({ where: { role: 'PROVIDER' }, select: { name: true } });
  existing.forEach(u => existingNames.add(u.name.toLowerCase()));

  let imported = 0;
  let skipped = 0;

  for (const p of providers) {
    if (existingNames.has(p.businessName.toLowerCase())) {
      skipped++;
      continue;
    }

    const catId = CATS[p.category] || CATS['Other'];
    const claimCode = generateClaimCode();
    const email = `provider-${crypto.randomBytes(4).toString('hex')}@unclaimed.jobsyja.com`;

    try {
      // Create unclaimed provider
      const unclaimed = await prisma.unclaimedProvider.create({
        data: {
          businessName: p.businessName,
          phone: p.phone,
          category: p.category,
          categoryId: catId,
          parish: p.parish,
          description: p.description,
          sourcePlatform: 'web_search_parish',
          isClaimed: true,
          claimCode,
        },
      });

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: randomPasswordHash(),
          name: p.businessName,
          role: 'PROVIDER',
          phone: p.phone,
          parish: p.parish,
          bio: p.description,
          isEmailVerified: false,
          isActive: true,
          verificationStatus: 'PENDING',
        },
      });

      // Link unclaimed to user
      await prisma.unclaimedProvider.update({
        where: { id: unclaimed.id },
        data: { claimedByUserId: user.id },
      });

      // Create service
      await prisma.service.create({
        data: {
          title: `${p.category} Services`,
          description: p.description || `${p.category} services by ${p.businessName} in ${p.parish}. Contact for pricing and availability.`,
          providerId: user.id,
          categoryId: catId,
          priceMin: 0,
          priceCurrency: 'JMD',
          priceUnit: 'per_service',
          parish: p.parish,
          tags: [p.category.toLowerCase()],
          isActive: true,
          isFeatured: false,
        },
      });

      existingNames.add(p.businessName.toLowerCase());
      imported++;
    } catch (err) {
      console.error(`  Error: ${p.businessName}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`Imported: ${imported}`);
  console.log(`Skipped: ${skipped}`);
  console.log('');

  // Final parish distribution
  const parishes = await prisma.service.groupBy({
    by: ['parish'],
    where: { isActive: true, deletedAt: null },
    _count: true,
    orderBy: { _count: { parish: 'desc' } },
  });
  const totalServices = await prisma.service.count({ where: { isActive: true, deletedAt: null } });

  console.log(`=== Final: ${totalServices} active services ===`);
  console.log('Parish distribution:');
  parishes.forEach(p => console.log(`  ${p.parish}: ${p._count}`));
}

main()
  .catch(err => { console.error('Import failed:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
