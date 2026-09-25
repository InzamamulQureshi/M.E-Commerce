# 🎁 The Fourfold — Bespoke Handcrafted Gifting Studio & E-Commerce Platform

A production-ready, full-stack e-commerce web application built for artisanal studios and handcrafted gift shops. Features a customer storefront with rich personalization options, UPI QR transfer & COD checkout, customer account management, and a comprehensive artisan admin dashboard.

---

## 🌟 Key Highlights & Features

### 🛍️ Customer Storefront
- **Artisan Catalog**: Dynamic product browsing with category and subcategory filtering, search, and responsive layout.
- **Bespoke Product Customization**:
  - Personalized recipient calligraphy messages & recipient names.
  - Custom melted wax seal color selection (Antique Gold, Burgundy Rose, Botanical Emerald).
  - Studio gift wrapping & keepsake packaging options.
  - Up to 4 curated craftsmanship highlights per product.
- **Multi-Address Checkout**:
  - Auto-fills default address from customer's account address book.
  - Interactive saved address picker for seamless 1-click address switching.
  - Zero hardcoded defaults for cities or states.
- **Payment Methods**:
  - **UPI QR Transfer**: Real-time QR generation with 12-digit transaction ID (UTR) verification.
  - **Cash on Delivery (COD)**: With configurable instructions.
- **Smart Promo Code Engine**:
  - Supports percentage or flat discounts with minimum order thresholds and maximum discount capping.
  - Audience targeting: New customers, repeat customers, or specific user accounts with redemption tracking.
- **Order Tracking**: Real-time order progress tracking (Pending ➔ Confirmed ➔ Handcrafting ➔ Packed ➔ Shipped ➔ Delivered).
- **Verified Customer Reviews**: Star ratings, verified buyer badges, and reviews showcase.

### 🛡️ Artisan Admin Portal (`/admin/dashboard`)
- **Operations Overview**: Real-time metrics on revenue, active crafting queue, inventory alerts, and bestsellers.
- **Order Fulfillment**: Complete order dossier, 1-click WhatsApp customer messaging, courier tracking assignment, printable packing slips, and order status lifecycle management.
- **Catalog & Inventory Suite**: Add and edit creations with multi-image gallery, materials, dimensions, stock counts, and customizable feature toggles.
- **Customer Directory & Moderation**:
  - Patron directory with lifetime spend, order count, and contact information.
  - **Account Moderation**: Suspend or permanently ban problem accounts with logged reasons and policy citations.
  - Instant filter tabs for All, Active, Suspended, and Banned patrons.
  - Banned and suspended accounts are strictly blocked from logging in or placing orders.
- **Studio Settings Hub**:
  - Branding, logo size, announcement bar toggles, homepage showcases, shipping fees, free shipping thresholds, UPI configurations, and theme customization.
- **Mobile-Responsive Admin**: Viewport-safe layout (`100dvh`), slide-out drawer, and bottom navigation optimized for mobile operation.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & ORM**: MySQL with Prisma ORM 5
- **Authentication**: JWT session tokens stored in secure, `httpOnly` cookies with bcryptjs password hashing
- **Icons**: Lucide React
- **Animations & Effects**: Canvas Confetti, Tailwind CSS animations

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+
- **MySQL**: 8.0+ (Local, Docker, WSL, or hosted MySQL)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/thefourfold-ecommerce.git
cd thefourfold-ecommerce
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your secure credentials:
```env
# Database Connection
DATABASE_URL="mysql://username:password@localhost:3306/thefourfold"

# Server Secrets (Keep private - never commit to Git)
BETTER_AUTH_SECRET="generate_a_long_random_64_char_secret_key"
ADMIN_SECRET_KEY="choose_a_strong_master_admin_passcode"
ADMIN_EMAIL="artisan@thefourfold.com"

# Public Branding & Payment Details
NEXT_PUBLIC_STORE_NAME="The Fourfold"
NEXT_PUBLIC_STORE_TAGLINE="Handcrafted with Love, Folded to Cherish"
NEXT_PUBLIC_INSTAGRAM="https://instagram.com/thefourfold.official"
NEXT_PUBLIC_WHATSAPP="+919876543210"
NEXT_PUBLIC_UPI_ID="thefourfold@oksbi"
NEXT_PUBLIC_UPI_NAME="The Fourfold Craft Studio"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 5. Initialize the Database
```bash
# Push schema to MySQL database
npx prisma db push

# (Optional) Seed demo products, categories, and initial data
npm run db:seed
```

### 6. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Security & Deployment Best Practices

- **Never Commit `.env`**: `.env` is listed in `.gitignore` to prevent database passwords and auth secrets from leaking to GitHub.
- **Production Secrets**: Always set strong, random values for `BETTER_AUTH_SECRET` and `ADMIN_SECRET_KEY` on your production hosting provider.
- **Client vs. Server Safety**: Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. All database queries, credentials, and hashing remain strictly server-side.

---

## 📄 License

Private & Proprietary — All rights reserved by The Fourfold Studio.
