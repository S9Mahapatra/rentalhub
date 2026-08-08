# RentalHub User Portal

A premium full-stack rental marketplace built with Next.js, TypeScript, Prisma, and NextAuth.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Credentials provider)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Validation**: Zod

## Features

### Product Browsing
- Browse products with search, filter by category, and sort
- Product detail pages with specifications and features
- Bestseller highlights
- Availability checking in real-time

### Rental System
- Flexible rental periods (daily, weekly, monthly rates)
- Dynamic pricing based on rental duration
- Minimum/maximum rental period enforcement
- Quantity selection with stock validation

### Cart & Checkout
- Add products with rental dates
- Quantity management
- Delivery or store pickup selection
- Payment method selection (card, UPI, net banking, wallet)
- Order summary with tax calculation (18% GST)

### Security Deposit
- Deposit collected at checkout
- Full refund on on-time return
- Partial refund with late fee deduction
- Transparent deposit breakdown

### Bookings & Orders
- Booking status tracking (pending, confirmed, active, returned, cancelled)
- Cancel bookings before pickup
- Return products with automatic late fee calculation
- Order history with invoice generation
- Order number generation (RH-XXXX-XXXX)

### Late Fee Logic
- 50% of daily rate per late day
- Automatically calculated on return
- Deducted from security deposit
- Remaining deposit refunded

### User Features
- Registration and login
- Profile management
- Multiple delivery addresses
- Wishlist
- Order history

## Project Structure

```
user/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # NextAuth + register
│   │   │   ├── products/       # Product CRUD
│   │   │   ├── categories/     # Category listing
│   │   │   ├── cart/           # Cart management
│   │   │   ├── wishlist/       # Wishlist toggle
│   │   │   ├── bookings/       # Booking CRUD
│   │   │   ├── orders/         # Order creation
│   │   │   └── users/          # Profile & addresses
│   │   ├── products/           # Products listing page
│   │   ├── product/[slug]/     # Product detail page
│   │   ├── cart/               # Cart page
│   │   ├── wishlist/           # Wishlist page
│   │   ├── bookings/           # Bookings page
│   │   ├── checkout/           # Checkout page
│   │   ├── profile/            # Profile page
│   │   └── auth/               # Login & Register
│   ├── components/             # Reusable UI components
│   │   ├── layout/             # Navbar, Hero, Footer
│   │   ├── product/            # ProductCard, CategoryNav, Bestsellers
│   │   └── providers/          # SessionProvider
│   ├── lib/                    # Utilities & config
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── auth.ts             # NextAuth configuration
│   │   └── utils.ts            # Helper functions
│   └── types/                  # TypeScript interfaces
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed script
├── .env.example                # Environment variables template
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (local or cloud)

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and NextAuth secret

# Push database schema
npx prisma db push

# Seed sample data
npm run db:seed

# Start development server
npm run dev
```

### Demo Credentials
- **Email**: demo@rentalhub.com
- **Password**: password123

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `NEXTAUTH_URL` | App URL for NextAuth | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for NextAuth JWT | - |
| `NEXT_PUBLIC_APP_NAME` | App display name | `RentalHub` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `http://localhost:3000` |

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/[...nextauth]` | NextAuth login/logout |
| GET | `/api/products` | List products (search, filter, sort) |
| GET | `/api/products/[slug]` | Get product by slug |
| GET | `/api/categories` | List categories |
| GET/POST/DELETE | `/api/cart` | Get/add/clear cart |
| PUT/DELETE | `/api/cart/[id]` | Update/remove cart item |
| GET/POST | `/api/wishlist` | Get/toggle wishlist |
| GET/POST | `/api/bookings` | List/create bookings |
| GET/PUT | `/api/bookings/[id]` | Get/update booking (cancel/return) |
| GET/POST | `/api/orders` | List/create orders |
| GET | `/api/orders/[id]` | Get order detail |
| GET/POST | `/api/users/profile` | Get/update profile & addresses |

## Business Rules

1. **Rental Pricing**: Daily rate by default. Weekly rate applied for 7+ days. Monthly rate for 30+ days.
2. **Security Deposit**: Collected at checkout. Refunded on return.
3. **Late Fees**: 50% of daily rate per late day. Deducted from deposit.
4. **Availability**: Real-time stock check against active bookings.
5. **Delivery**: ₹99 delivery fee. Free store pickup.
6. **Tax**: 18% GST on rental amount.

## License

MIT
