# MEMORY.md

## Project Identity

Project: RentalHub
Type: Full-stack Rental Management User/Client Portal
Tech Stack: Next.js 14 + TypeScript + Mongoose + NextAuth + Tailwind CSS + Framer Motion

## Current Development Status

Completed:
- Full-stack Next.js application with API routes
- Mongoose schemas for all models (User, Product, Category, Cart, Wishlist, Booking, Order)
- NextAuth.js authentication with credentials provider
- All API routes (products, categories, cart, wishlist, bookings, orders, users)
- High-contrast, premium Light UI theme (white backgrounds, black elements/buttons) with Emerald Green accents and soft rounded borders
- Tailwind CSS and Framer Motion for styling and micro-animations
- All pages: Home, Products, Product Detail, Cart, Wishlist, Bookings, Checkout, Profile, Auth
- Business logic: availability checking, rental pricing, late fees, security deposits
- Seed script with sample data
- Complete documentation

## Data Models

Implemented as Mongoose schemas in `src/models/`:
- User (auth, profile, addresses, wishlist)
- Category (name, slug, icon)
- Product (pricing tiers, stock, specifications, rating)
- Cart (items with rental dates and computed prices)
- Booking (rental period, amounts, status, return/late fees)
- Order (items, totals, payment, status)

## Key Business Rules

1. Rental pricing: daily/weekly/monthly rates auto-selected based on duration
2. Security deposit collected at checkout, refunded on return
3. Late fees: 50% of daily rate per late day, deducted from deposit
4. Real-time availability checking against overlapping bookings
5. ₹99 delivery fee, free store pickup
6. 18% GST on rental amount

## Architecture Decisions

Decision: Single Next.js app with API routes (no separate backend)
Reason: Simpler deployment, shared types, reduced complexity
Date: 2026-08-08

Decision: Mongoose + MongoDB Atlas
Reason: Flexible document model, good fit for product catalog and nested schemas
Date: 2026-08-08

Decision: NextAuth.js with JWT strategy
Reason: Simple setup, secure, supports credentials provider
Date: 2026-08-08

## Design System & UI Guidelines
- **Theme**: Premium Light Theme
- **Color Palette**: 
  - Backgrounds: White (`bg-white`, `bg-[#F7F7F9]`)
  - Typography/Buttons: High contrast black (`text-neutral-950`, `bg-neutral-950`)
  - Accents: Emerald Green (`emerald-50`, `emerald-500`, `emerald-600`) for availability badges, active states, and highlights.
- **Shapes**: Pill-shaped buttons (`rounded-full`), soft rounded corners for cards (`rounded-[20px]`, `rounded-[11px]`).
- **Strict Rule**: Every new page, component, and button must perfectly adhere to this aesthetic. No deviations or dark-mode overrides without explicit permission.
