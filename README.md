# M.E-Commerce

A full-stack, modular e-commerce platform built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma ORM, and MySQL.

![Storefront Preview](./homepage_preview.png)

## Documentation

- **[Non-Technical Deployment Guide](./NON_TECHNICAL_DEPLOYMENT_GUIDE.md)**: Plain-language guide for deploying the store without technical background.
- **[Admin Portal User Guide](./ADMIN_PORTAL_USER_GUIDE.md)**: How to manage products, orders, coupons, customer reviews, and site settings.
- **[Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)**: Production deployment instructions for Vercel with remote MySQL.
- **[Hostinger & VPS Deployment Guide](./HOSTINGER_DEPLOYMENT.md)**: Deployment steps for Hostinger VPS (Dokploy/Docker) and shared hosting.

---

## Features

### Storefront & Checkout
- **Catalog & Navigation**: Categorized catalog, instant search, price filters, and megamenu navigation.
- **Product Details**: Image gallery with zoom, variant selection (size/color), stock status badges, customer reviews, and custom options (gift wrapping, notes, wax seal).
- **Cart & Discounts**: Slide-out cart drawer, dedicated cart page, free shipping threshold bar, and coupon code support.
- **Payment Options**:
  - **Razorpay**: Credit/Debit Cards, Netbanking, UPI, and Wallets.
  - **Manual UPI QR**: Dynamic QR code with mandatory 12-digit UTR reference verification.
  - **Cash on Delivery (COD)**: Configurable fee and order value limits.
- **Order Tracking**: Visual status timeline (*Confirmed -> Processing -> Shipped with AWB Tracking -> Delivered*).

### Authentication & Customer Accounts
- **Passwordless / OTP Verification**: 6-digit email OTP for account registration and password resets (10-minute expiry, 60-second rate-limiting cooldown).
- **Address Book**: Save multiple shipping addresses with default address selection.
- **Profile Management**: Update profile details and change passwords with 2FA email verification.

### Admin Dashboard (`/admin/dashboard`)
- **Overview & Analytics**: Total revenue, order count, average order value, customer metrics, and recent orders.
- **Order Fulfillment**: Update order statuses, add courier tracking numbers (AWB) and URLs, cancel/reject with customer notes, and print packing slips.
- **Product Management**: Full CRUD for products, multi-image uploads, price/compare-at pricing, inventory tracking, and custom option toggles.
- **Category Management**: Hierarchical categories and subcategories with cover images for megamenu display.
- **Promotions**: Percentage and fixed-amount coupon codes with minimum spend, usage limits, and expiration dates.
- **Customer Moderation**: Customer list, lifetime spend tracking, and account suspension/ban toggles.
- **Review Moderation**: Approve or hide customer reviews; post official verified replies.
- **CMS & Settings**: Live configuration for announcement bar, hero banner, store branding/logo, brand story, payment methods, shipping thresholds, and color themes.

### Emails & Background Infrastructure
- **Transactional Emails**: HTML templates via React Email and Resend for order confirmations and OTP verification.
- **Dynamic Assets**: Dynamic SVG favicon generation and `@resvg/resvg-js` OpenGraph social cards (1200x630).

---

## Tech Stack

| Component | Technology |
|---|---|
| Framework | Next.js 14.2 (App Router) |
| Language | TypeScript 5.6 |
| Styling | Tailwind CSS 3.4 |
| Database | MySQL 8.0+ |
| ORM | Prisma 5.21 |
| Payments | Razorpay Node SDK |
| Emails | Resend & React Email |
| Authentication | JWT (HTTP-only cookies) + bcryptjs |

---

## Quickstart

### Prerequisites
- Node.js 18.18+ or 20+
- npm 9+
- A running MySQL 8 database (local Docker, VPS, or cloud provider)

### 1. Clone & Install
```bash
git clone https://github.com/InzamamulQureshi/M.E-Commerce.git
cd M.E-Commerce
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Update `.env` with your database and authentication settings:
```env
DATABASE_URL="mysql://root:password@localhost:3306/mecommerce"
BETTER_AUTH_SECRET="your_random_64_char_secret_key"
ADMIN_SECRET_KEY="your_secure_admin_passcode"
ADMIN_EMAIL="admin@mecommerce.dev"

# Public store details
NEXT_PUBLIC_STORE_NAME="M.E-Commerce"
NEXT_PUBLIC_STORE_TAGLINE="Modern, Minimalist & Modular E-Commerce"
NEXT_PUBLIC_UPI_ID="mecommerce@oksbi"
NEXT_PUBLIC_UPI_NAME="M.E-Commerce Studio"

# Optional: Razorpay
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
NEXT_PUBLIC_RAZORPAY_KEY_ID=""

# Optional: Resend
RESEND_API_KEY=""
EMAIL_FROM="M.E-Commerce <onboarding@resend.dev>"
```

### 3. Initialize Database
```bash
# Push Prisma schema to MySQL
npm run db:push

# (Optional) Seed demo products, categories, and settings
npm run db:seed
```

### 4. Run Locally
```bash
npm run dev
```
Open:
- Storefront: `http://localhost:3000`
- Admin Portal: `http://localhost:3000/admin/login`

---

## Environment Variables

| Variable | Scope | Required | Description |
|---|:---:|:---:|---|
| `DATABASE_URL` | Server | Yes | MySQL connection string (e.g. `mysql://user:pass@host:3306/db?connection_limit=5`). |
| `BETTER_AUTH_SECRET` | Server | Yes | Secret used to sign JWT session cookies. |
| `ADMIN_SECRET_KEY` | Server | Yes | Master passcode for admin authentication. |
| `ADMIN_EMAIL` | Server | Yes | Primary admin email address. |
| `NEXT_PUBLIC_STORE_NAME` | Client/Server | Yes | Store name displayed across pages and headers. |
| `NEXT_PUBLIC_STORE_TAGLINE` | Client/Server | No | Store subtitle used in hero banners and meta tags. |
| `NEXT_PUBLIC_UPI_ID` | Client/Server | No | UPI VPA address for QR payments. |
| `NEXT_PUBLIC_UPI_NAME` | Client/Server | No | Payee name shown during UPI payments. |
| `NEXT_PUBLIC_WHATSAPP` | Client/Server | No | Support WhatsApp contact number. |
| `NEXT_PUBLIC_INSTAGRAM` | Client/Server | No | Instagram profile URL. |
| `RAZORPAY_KEY_ID` | Server | No | Razorpay Key ID for backend order generation. |
| `RAZORPAY_KEY_SECRET` | Server | No | Razorpay Secret Key for payment verification. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client/Server | No | Razorpay Key ID for client checkout modal. |
| `RESEND_API_KEY` | Server | No | Resend API key for sending emails. |
| `EMAIL_FROM` | Server | No | Verified sender email address in Resend. |
| `ENABLE_DEMO_OTP` | Server | No | If `"true"`, includes OTP in API responses for development/testing. |
| `NEXT_PUBLIC_ENABLE_DEMO_OTP`| Client/Server | No | If `"true"`, renders testing OTP banner and logs to browser console. |
| `ENABLE_DEMO_ADMIN` | Server | No | If `"true"`, enables read-only demo admin credentials. |
| `NEXT_PUBLIC_ENABLE_DEMO_ADMIN`| Client/Server| No | If `"true"`, shows demo admin button on login page. |

---

## Project Structure

```
├── prisma/
│   ├── schema.prisma       # Database models (User, Product, Order, Setting, Coupon)
│   └── seed.ts             # Default data seeder
├── public/                 # Static assets & OpenGraph images
├── src/
│   ├── app/
│   │   ├── (store)/        # Storefront pages (catalog, product, cart, checkout, account)
│   │   ├── admin/          # Admin portal routes (/admin/login, /admin/dashboard/*)
│   │   └── api/            # API route handlers (auth, orders, payments, products, settings)
│   ├── components/
│   │   ├── admin/          # Admin UI components, modals, and settings forms
│   │   └── store/          # Storefront UI (header, footer, cart drawer, cards)
│   ├── emails/             # React Email templates
│   ├── lib/
│   │   ├── auth.ts         # Server-side JWT authentication utilities
│   │   ├── cart-store.ts   # Client-side cart state
│   │   ├── db.ts           # Prisma client singleton
│   │   └── email/          # Email dispatch helper
│   └── middleware.ts       # Edge route protection for admin and user routes
└── docker-compose.yml      # Local MySQL service definition
```

---

## License

MIT License. Free for personal and commercial use.
