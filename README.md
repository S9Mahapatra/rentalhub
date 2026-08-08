# RentalHub

A full-stack rental marketplace built with Next.js, TypeScript, Prisma, and NextAuth.

## Project Structure

```
rentalhub/
└── user/          # Next.js full-stack application
    ├── src/
    │   ├── app/       # Pages & API routes
    │   ├── components/# Reusable UI components
    │   ├── lib/       # Utilities & config
    │   └── types/     # TypeScript interfaces
    ├── prisma/        # Database schema & seed
    └── ...
```

## Quick Start

```bash
cd user
npm install
cp .env.example .env   # Configure DATABASE_URL and NEXTAUTH_SECRET
npx prisma db push
npm run db:seed
npm run dev
```

## Demo Credentials

- **Email**: demo@rentalhub.com
- **Password**: password123

## Documentation

See [user/README.md](user/README.md) for full documentation.
