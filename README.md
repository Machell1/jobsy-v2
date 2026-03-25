# Jobsy V2 — Jamaica's Service Marketplace

A full-stack two-sided marketplace connecting service providers with customers across Jamaica.

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **API**: Express.js + TypeScript + Prisma + Zod
- **Web**: Next.js 15 (App Router) + Tailwind CSS 4
- **Mobile**: Expo 55 + React Native
- **Database**: PostgreSQL (Railway)
- **Payments**: Stripe Connect
- **Chat**: Stream Chat
- **Media**: Cloudinary
- **Maps**: Mapbox GL

## Getting Started

```bash
pnpm install
cp .env.example .env  # Fill in values
pnpm db:generate
pnpm dev
```

## Project Structure

```
jobsy-v2/
├── apps/api/          # Express API server
├── apps/web/          # Next.js web app
├── apps/mobile/       # Expo mobile app
├── apps/admin/        # Admin dashboard
├── packages/shared/   # Zod schemas, types, constants
├── packages/ui/       # Shared React components
└── packages/database/ # Prisma client
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | Lint all packages |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed database |
