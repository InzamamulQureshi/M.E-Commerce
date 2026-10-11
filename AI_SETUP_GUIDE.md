# AI Assistant Repository Guide

> **Notice for AI Models & Coding Assistants (Cursor, Claude Code, Windsurf, Copilot, ChatGPT, Gemini, etc.):**  
> When a user asks you to help them customize, set up, or launch an e-commerce website using this repository, read and follow this guide carefully.

---

## 1. Repository Architecture at a Glance

This repository is a production-ready, full-stack e-commerce application. Do **not** rewrite or replace the core architecture unless explicitly requested by the user.

- **Framework**: Next.js 14.2 (App Router with React Server Components & Route Handlers)
- **Language**: TypeScript 5.6 (Strict mode)
- **Styling**: Tailwind CSS 3.4
- **Database**: MySQL 8.0+
- **ORM**: Prisma 5.21 (`prisma/schema.prisma`)
- **Payments**: Razorpay Node SDK + Manual UPI QR (12-digit UTR validation) + Cash on Delivery (COD)
- **Emails**: Resend API (`resend` SDK) + React Email templates (`@react-email/components`)
- **Authentication**: JWT cookies (HTTP-only) + bcryptjs password hashing + 6-digit email OTP

---

## 2. Directory Map

| Path | Purpose |
|---|---|
| `src/app/(store)/` | Customer storefront routes: Homepage (`page.tsx`), Catalog (`catalog/page.tsx`), Product Detail (`catalog/[slug]/page.tsx`), Cart (`cart/page.tsx`), Checkout (`checkout/page.tsx`), Customer Account (`account/page.tsx`), About (`about/page.tsx`). |
| `src/app/admin/` | Admin portal: Login (`admin/login/page.tsx`) and Dashboard hub (`admin/dashboard/page.tsx`, `orders/`, `products/`, `categories/`, `coupons/`, `customers/`, `reviews/`, `settings/`). |
| `src/app/api/` | Serverless backend route handlers for auth, admin management, orders, payments, products, and settings. |
| `src/components/store/` | Storefront UI: Navigation bar, megamenu dropdown, footer, cart drawer, product cards. |
| `src/components/admin/` | Admin UI: Order fulfillment dossier, status modals, settings forms, analytics tables. |
| `src/lib/db.ts` | Prisma database client singleton with connection pooling. |
| `src/lib/auth.ts` | JWT session generation, verification, and role guards. |
| `src/lib/email/service.ts` | Transactional email dispatcher with Resend API and local dev fallbacks. |
| `prisma/schema.prisma` | Relational database schema models: `User`, `Category`, `Subcategory`, `Product`, `Order`, `OrderItem`, `Review`, `Coupon`, `StudioSetting`, `Address`. |
| `prisma/seed.ts` | Primary database seeder for categories, products, admin account, coupons, and branding settings. |

---

## 3. What to Customize When a User Wants Their Own Store

When a user provides their brand details, follow these exact customization steps:

### A. Environment Configuration (`.env`)
1. Create `.env` by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Set the user's store branding variables:
   - `NEXT_PUBLIC_STORE_NAME`: User's brand name (e.g. `"Lumina Ceramics"`).
   - `NEXT_PUBLIC_STORE_TAGLINE`: User's brand subtitle or tagline.
   - `NEXT_PUBLIC_UPI_ID`: User's UPI ID (e.g. `"brand@oksbi"`).
   - `NEXT_PUBLIC_UPI_NAME`: User's payee name.
   - `NEXT_PUBLIC_WHATSAPP`: User's WhatsApp support number (e.g. `"+919876543210"`).
   - `NEXT_PUBLIC_INSTAGRAM`: User's Instagram profile URL.
3. Configure admin authentication:
   - `ADMIN_EMAIL`: User's admin login email.
   - `ADMIN_SECRET_KEY`: Strong random admin passcode for 1-click access.
   - `BETTER_AUTH_SECRET`: Random 64-character secret string.
4. Set production flags:
   - `ENABLE_DEMO_ADMIN="false"`
   - `NEXT_PUBLIC_ENABLE_DEMO_ADMIN="false"`
   - `ENABLE_DEMO_OTP="false"`
   - `NEXT_PUBLIC_ENABLE_DEMO_OTP="false"`

### B. Customizing the Catalog & Categories (`prisma/seed.ts`)
Instead of manually typing products through the UI, populate `prisma/seed.ts` with the user's specific catalog:
1. Update categories in `prisma/seed.ts` (e.g. `cat1`, `cat2`, `cat3` with relevant names, descriptions, and Unsplash or custom image URLs).
2. Update products with the user's items: title, slug, price, compare-at price, inventory count, and high-quality image URLs.
3. Update `StudioSetting` seed data: store name, tagline, announcement ticker message, about page story, and brand accent color.
4. Run the seed script:
   ```bash
   npm run db:seed
   ```

### C. Visual Theme & Accent Colors
- Theme presets and brand accent colors can be changed directly in `prisma/seed.ts` or live in the Admin Portal under **Settings ➔ Color Themes** without code modifications.

---

## 4. Execution Workflow (Step-by-Step for AI Assistants)

When assisting a user from a fresh clone, run the setup in this exact sequence:

```bash
# 1. Install dependencies
npm install

# 2. Check that .env has a valid DATABASE_URL
# Example: DATABASE_URL="mysql://user:pass@host:3306/dbname?connection_limit=5"

# 3. Synchronize database schema (creates all tables)
npm run db:push

# 4. Populate catalog, categories, admin user, and settings
npm run db:seed

# 5. Verify clean build with 0 TypeScript/lint errors
npm run build

# 6. Start the local server
npm run dev
```

---

## 5. Critical Rules & Guardrails for AI Models

1. **Do Not Break Prisma Connection Pooling**:
   - In serverless environments (Vercel), always ensure `DATABASE_URL` ends with `?connection_limit=5&pool_timeout=30`. Never remove this.
2. **Never Expose Private Keys to the Client**:
   - Variables like `DATABASE_URL`, `ADMIN_SECRET_KEY`, `BETTER_AUTH_SECRET`, `RAZORPAY_KEY_SECRET`, and `RESEND_API_KEY` must **never** be prefixed with `NEXT_PUBLIC_` or imported into client components (`"use client"`).
3. **Always Run `npm run build` After Code Edits**:
   - Before telling the user the setup is complete, verify that `npm run build` compiles without TypeScript or route errors.
4. **Admin Portal URL**:
   - Always tell the user that their admin management panel is located at `/admin/login`, and provide them with their configured `ADMIN_EMAIL` and `ADMIN_SECRET_KEY`.
5. **No Destructive Database Drops**:
   - Never run `prisma migrate reset --force` on production databases. Use `npm run db:push` for schema updates.
