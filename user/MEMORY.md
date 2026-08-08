# MEMORY.md

## Project Identity

Project: RentalHub
Type: Full-stack Rental Management User/Client Portal
Tech Stack: Next.js 14 + TypeScript + Prisma + NextAuth + Tailwind CSS + Framer Motion

## Current Development Status

Completed:
- Full-stack Next.js application with API routes
- Prisma schema with all models (User, Product, Category, Cart, Wishlist, Booking, Order, Address)
- NextAuth.js authentication with credentials provider
- All API routes (products, categories, cart, wishlist, bookings, orders, users)
- Dark cinematic UI with Tailwind CSS and Framer Motion animations
- All pages: Home, Products, Product Detail, Cart, Wishlist, Bookings, Checkout, Profile, Auth
- Business logic: availability checking, rental pricing, late fees, security deposits
- Seed script with sample data
- Complete documentation

## Data Models

Implemented in Prisma schema:
- User (auth, profile, addresses)
- Category (name, slug, icon)
- Product (pricing, stock, specifications, rating)
- Cart (items with rental dates and prices)
- Wishlist (user-product pairs)
- Booking (rental period, amounts, status, return/late fees)
- Order (items, totals, payment, status)
- Address (delivery addresses)

## Key Business Rules

1. Rental pricing: daily/weekly/monthly rates auto-selected
2. Security deposit collected at checkout, refunded on return
3. Late fees: 50% of daily rate per late day, deducted from deposit
4. Real-time availability checking against overlapping bookings
5. ₹99 delivery fee, free store pickup
6. 18% GST on rental amount

## Architecture Decisions

Decision: Single Next.js app with API routes (no separate backend)
Reason: Simpler deployment, shared types, reduced complexity
Date: 2026-08-08

Decision: Prisma + PostgreSQL
Reason: Type-safe database access, excellent migrations, production-ready
Date: 2026-08-08

Decision: NextAuth.js with JWT strategy
Reason: Simple setup, secure, supports credentials provider
Date: 2026-08-08
