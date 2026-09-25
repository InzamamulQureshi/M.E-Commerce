# Hostinger Production Deployment Guide for M.E-Commerce

This guide details how to deploy **M.E-Commerce** on **Hostinger Web Hosting** with Hostinger MySQL, ensuring full security and zero client-side secret leakage.

---

## 1. Create Hostinger MySQL Database

1. Log in to your **Hostinger hPanel**.
2. Navigate to **Databases** ➔ **MySQL Databases**.
3. Create a new database:
   - **Database Name:** e.g., `u123456789_mecommerce`
   - **Username:** e.g., `u123456789_mecommerce_user`
   - **Password:** Enter a strong password (e.g. `MeCommerceAdmin#2026`)
4. Note down your Hostinger MySQL details (Hostinger typically uses `localhost` or `127.0.0.1` for local database connections within the same hosting account).

---

## 2. Configure Environment Variables (Strictly Server-Side)

In Hostinger File Manager or Node.js configuration, create/update `.env`:

```env
# Hostinger MySQL Connection
DATABASE_URL="mysql://u123456789_mecommerce_user:MeCommerceAdmin#2026@localhost:3306/u123456789_mecommerce"

# Secret Authentication Keys (Kept strictly on the server)
BETTER_AUTH_SECRET="generate_a_long_random_64_character_secret"
ADMIN_SECRET_KEY="your_secret_admin_master_passcode"
ADMIN_EMAIL="admin@mecommerce.dev"

# Public Branding & Contact
NEXT_PUBLIC_STORE_NAME="M.E-Commerce"
NEXT_PUBLIC_STORE_TAGLINE="Modern, Minimalist & Modular E-Commerce"
NEXT_PUBLIC_INSTAGRAM="https://instagram.com/mecommerce.official"
NEXT_PUBLIC_WHATSAPP="+919876543210"
NEXT_PUBLIC_UPI_ID="mecommerce@oksbi"
NEXT_PUBLIC_UPI_NAME="M.E-Commerce Studio"
```

> **Security Note:** None of the database credentials or auth secrets are prefixed with `NEXT_PUBLIC_`. Next.js strictly compiles these only into the private server runtime, guaranteeing that no database passwords or admin secrets ever leak into client browser JavaScript.

---

## 3. Setup Hostinger Node.js Application

1. In hPanel, go to **Advanced** ➔ **Node.js**.
2. Click **Create Application**:
   - **Node.js Version:** Select `20.x` or `22.x`
   - **Application Root:** `/home/u123456789/domains/yourdomain.com/public_html`
   - **Application Startup File:** `node_modules/next/dist/bin/next` or `npm` script
   - **Application Mode:** `Production`
3. Upload the project files (or clone via Git in hPanel).
4. Run npm install:
   ```bash
   npm install
   ```

---

## 4. Push Database Schema & Seed Initial Inventory

In the Hostinger SSH Terminal or Web Terminal:

```bash
# Push Prisma schema to Hostinger MySQL
npx prisma db push

# Seed initial catalog, categories, and admin user
node prisma/dist/seed.js
```

---

## 5. Build and Start

1. Compile the Next.js production build:
   ```bash
   npm run build
   ```
2. Start the application:
   ```bash
   npm run start
   ```
3. In hPanel Node.js section, click **Restart Application**.

---

## 6. Accessing the Admin Portal

Manage all products, subcategories, pricing, stock, coupons, and orders directly via the admin portal:

- **Admin Portal URL:** `https://yourdomain.com/admin/login`
- **Master Passcode:** Defined in `ADMIN_SECRET_KEY` in your `.env`
- **Default Admin Login:** `admin@mecommerce.dev` / `mecommerce_admin_2026`

Store owners can:
- Configure live store branding, SVG favicons, social OpenGraph cards, and accent colors without code changes.
- Add and edit catalog items with photos, dimensions, materials, and customization switches.
- Create categories and subcategories dynamically.
- View and manage orders, update tracking numbers, and verify payments.
