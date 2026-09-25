# M.E-Commerce

A modern, minimalist, and fully modular full-stack e-commerce platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**.

Designed for creators, independent brands, and bespoke studios who want an editorial storefront paired with complete control over branding, catalog, and checkout.

---

## Architecture & Core Principles

### 1. Minimalist Aesthetic
- **Editorial Typography & Whitespace**: Distraction-free layout designed around product imagery and clean lines.
- **Native Dark & Light Mode**: Seamless theme switching with persistent user preference.
- **Mobile-First Experience**: Fluid mobile drawer, sticky bottom navigation, and viewport-safe modals (`100dvh`).

### 2. 100% Modular by Design
- **Live Branding Hub**: Configure store name, location, logo size, brand accent color, and typography without code changes.
- **Custom SVG Favicons & Monograms**: Live raw SVG markup editor, SVG data URIs, or automated store monogram generation served at `/api/branding/favicon.svg`.
- **Dynamic OpenGraph & Social Cards**: Custom OG titles, descriptions, and banner images with live preview in the admin panel.
- **Modular Product Customization**: Toggle gift wrapping, wax seal accents, personal gift notes, and craft lead times on a per-product basis.
- **Flexible Payments**: Built-in support for dynamic **UPI QR Transfer** (with instant UTR payment reference validation) and **Cash on Delivery (COD)**.

### 3. Integrated Admin Dashboard (`/admin/dashboard`)
- **Operations & Orders**: Complete order dossier, live status transitions, courier tracking, and printable packing slips.
- **Catalog & Inventory**: Manage products, categories, subcategories, stock levels, and multi-image galleries.
- **Promotions & Coupons**: Percentage or fixed-amount discounts with minimum spend rules, expiration dates, and usage limits.
- **Customer Directory & Moderation**: Customer spend analytics with suspension and permanent ban controls.
- **Review Moderation**: Star ratings, verified buyer badges, and official store team replies.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, Server & Client Components) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS |
| Database | MySQL 8.0+ |
| ORM | Prisma ORM 5 |
| Authentication | JWT session tokens in secure `httpOnly` cookies + bcryptjs |
| Icons | Lucide React |

---

## Quickstart

### 1. Clone the Repository
```bash
git clone https://github.com/InzamamulQureshi/M.E-Commerce.git
cd M.E-Commerce
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your configuration:
```env
# Database Connection (Docker local or hosted MySQL)
DATABASE_URL="mysql://root:password@localhost:3306/mecommerce"

# Server Secrets (Keep private)
BETTER_AUTH_SECRET="generate_a_long_random_secret_string"
ADMIN_SECRET_KEY="choose_a_secure_admin_passcode"
ADMIN_EMAIL="admin@mecommerce.dev"

# Store Defaults (Editable later in Admin Settings)
NEXT_PUBLIC_STORE_NAME="M.E-Commerce"
NEXT_PUBLIC_STORE_TAGLINE="Modern, Minimalist & Modular E-Commerce"
NEXT_PUBLIC_INSTAGRAM="https://instagram.com/mecommerce.official"
NEXT_PUBLIC_WHATSAPP="+919876543210"
NEXT_PUBLIC_UPI_ID="mecommerce@oksbi"
NEXT_PUBLIC_UPI_NAME="M.E-Commerce Studio"
```

### 4. Start Local Database (Optional: Docker)
```bash
docker-compose up -d
```

### 5. Push Database Schema & Seed Catalog
```bash
# Push Prisma schema to MySQL
npx prisma db push

# (Optional) Seed demo products, categories, and settings
npm run db:seed
```

### 6. Start Development Server
```bash
npm run dev
```

Visit:
- **Storefront**: [http://localhost:3000](http://localhost:3000)
- **Admin Portal**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)  
  *Default admin: `admin@mecommerce.dev` (or authenticate using your `ADMIN_SECRET_KEY`)*

---

## Directory Structure

```
├── prisma/
│   ├── schema.prisma        # Database models (User, Product, Order, StudioSetting, etc.)
│   └── seed.ts              # Initial catalog and store configuration seed
├── src/
│   ├── app/
│   │   ├── (store)/         # Public customer storefront routes
│   │   ├── admin/           # Admin dashboard, catalog, orders, and settings routes
│   │   ├── api/             # REST endpoints (auth, orders, products, settings, branding)
│   │   └── layout.tsx       # Root layout with dynamic metadata and SVG favicon injection
│   ├── components/
│   │   ├── admin/           # Admin modals, sidebar, table views, and settings forms
│   │   └── store/           # Product cards, cart drawer, checkout, and layout elements
│   ├── lib/
│   │   ├── auth.ts          # Server-side auth, JWT token signing, and session cache
│   │   ├── auth-client.ts   # Client auth hook and synchronization
│   │   ├── cart-store.ts    # Reactive cart store with local persistence
│   │   └── db.ts            # Prisma client singleton
│   └── middleware.ts        # Route guard for admin web pages and protected APIs
├── docker-compose.yml       # Local MySQL container definition
└── tailwind.config.js       # Design tokens and theme extensions
```

---

## Security

- **Server-Side Credential Isolation**: Database credentials and authentication secrets remain strictly server-side. No private keys are prefixed with `NEXT_PUBLIC_`.
- **Role-Based Guards**: Protected routes (`/admin/dashboard/*` and `/api/admin/*`) are guarded by Next.js middleware and session role validation.
- **Account Moderation**: Suspended or banned users are automatically denied login, API ordering, and checkout capabilities.

---

## License

MIT License. Open source and free to use for personal and commercial projects.
