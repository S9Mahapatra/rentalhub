# MEMORY.md

## Project Identity

Project: RentalHub
Type: Full-stack Rental Management Client Portal
Hackathon: Yes
Scope: Client/Portal User frontend + backend

## Problem Statement Summary

Rental businesses lack a centralized system to monitor operations, track pickups/returns, automate late return charges, and efficiently manage security deposits. RentalHub aims to solve this by providing an integrated rental experience. Portal users need a platform to browse products, select rental periods, manage carts, pay (including security deposits), download invoices, and manage returns where deposits are automatically refunded or deducted based on late penalties.

## Current Development Status

Completed:
- Requirements analysis and extraction from problem statement.
- Initial documentation setup (README, ARCHITECTURE, MEMORY).

In Progress:
- Project initialization.

Pending:
- Tech stack selection and initialization.
- Frontend and backend scaffolding.
- Database schema creation.
- API implementation.
- UI/UX implementation.

## Architecture Summary

Status: Planned. The architecture will consist of a Frontend application for the Client Portal, a Backend API to handle business logic and database interactions, and a Database for persistence. Authentication and Payment services will be integrated.

## Important Business Rules

* Security deposit is collected during rental confirmation.
* Deposit is held until the product is returned.
* On-time return results in the security deposit being refunded completely.
* Late return results in a penalty being calculated.
* The penalty is deducted from the security deposit.
* The remaining deposit is refunded to the client.
* Users can choose delivery or store pickup.
* Users can access and manage all their rental orders, addresses, and profile information.

## Data Models

Status: Planned. No models currently exist in the codebase.

## API Context

Status: Planned. No APIs currently exist in the codebase.

## Frontend Context

Status: Planned. No frontend code currently exists.

## Backend Context

Status: Planned. No backend code currently exists.

## Development Decisions

Decision: Strict adherence to existing codebase for documentation.
Reason: To ensure documentation accurately reflects reality without hallucinating features or technologies that haven't been implemented yet.
Date: 2026-08-08
Impact: Initial documentation reflects an empty project state for all technical sections.

## Known Issues

* None currently (No code exists).

## AI Agent Rules

1. Read `MEMORY.md` before making significant changes.
2. Read `ARCHITECTURE.md` before changing architecture.
3. Do not introduce a new library without a reason.
4. Do not break existing APIs without documenting the change.
5. Update documentation when architecture or business logic changes.
6. Never expose secrets.
7. Never invent APIs, database fields, or business requirements.
8. Prefer the existing project patterns over introducing new patterns.
9. Keep the client portal scope separate from admin functionality unless explicitly requested.
10. Before implementing a feature, check whether it already exists.
