import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Home Cleaning', slug: 'home-cleaning', icon: 'sparkles', sortOrder: 1 },
  { name: 'Plumbing', slug: 'plumbing', icon: 'wrench', sortOrder: 2 },
  { name: 'Electrical', slug: 'electrical', icon: 'zap', sortOrder: 3 },
  { name: 'Landscaping', slug: 'landscaping', icon: 'trees', sortOrder: 4 },
  { name: 'Painting', slug: 'painting', icon: 'paintbrush', sortOrder: 5 },
  { name: 'Moving', slug: 'moving', icon: 'truck', sortOrder: 6 },
  { name: 'Tutoring', slug: 'tutoring', icon: 'graduation-cap', sortOrder: 7 },
  { name: 'Photography', slug: 'photography', icon: 'camera', sortOrder: 8 },
  { name: 'Catering', slug: 'catering', icon: 'utensils', sortOrder: 9 },
  { name: 'Beauty & Hair', slug: 'beauty-hair', icon: 'scissors', sortOrder: 10 },
  { name: 'Auto Repair', slug: 'auto-repair', icon: 'car', sortOrder: 11 },
  { name: 'Tech Support', slug: 'tech-support', icon: 'monitor', sortOrder: 12 },
  { name: 'Pet Care', slug: 'pet-care', icon: 'paw-print', sortOrder: 13 },
  { name: 'Fitness Training', slug: 'fitness-training', icon: 'dumbbell', sortOrder: 14 },
  { name: 'Event Planning', slug: 'event-planning', icon: 'calendar', sortOrder: 15 },
  { name: 'Construction', slug: 'construction', icon: 'hard-hat', sortOrder: 16 },
  { name: 'Tailoring', slug: 'tailoring', icon: 'shirt', sortOrder: 17 },
  { name: 'Other', slug: 'other', icon: 'grid', sortOrder: 18 },
];

async function main() {
  console.log('Seeding categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log('Seeding admin user...');
  // Pre-computed bcrypt hash for "admin123456"
  // In production the admin is created via API with proper password hashing.
  const adminPasswordHash = '$2a$12$LJ3m4ys9Rq9V5muAdQ.zPOYFCkiPnSWJKJChtE5ML/XNZ.r2J6xHK';

  await prisma.user.upsert({
    where: { email: 'admin@jobsyja.com' },
    update: {},
    create: {
      id: '7a235c64-197f-4a35-aa7f-f09574b56969',
      email: 'admin@jobsyja.com',
      passwordHash: adminPasswordHash,
      name: 'Jobsy Admin',
      role: 'ADMIN',
      isEmailVerified: true,
      isActive: true,
      verificationStatus: 'APPROVED',
    },
  });

  console.log('Seed completed.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
