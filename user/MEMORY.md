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
- Dark cinematic UI with Tailwind CSS and Framer Motion animations
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
