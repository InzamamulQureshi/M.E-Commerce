# Hostinger Production Deployment Guide for The Fourfold

This guide details how to deploy **The Fourfold** e-commerce application on **Hostinger Web Hosting** with Hostinger MySQL, ensuring 100% security and zero client-side secret leakage.

---

## 1. Create Hostinger MySQL Database

1. Log in to your **Hostinger hPanel**.
2. Navigate to **Databases** ➔ **MySQL Databases**.
3. Create a new database:
   - **Database Name:** e.g., `u123456789_thefourfold`
   - **Username:** e.g., `u123456789_fourfold_user`
   - **Password:** Enter a strong password (e.g. `FourfoldArtisan#2026`)
4. Note down your Hostinger MySQL details. (Hostinger typically uses `localhost` or `127.0.0.1` for local database connections within the same hosting account).

---

## 2. Configure Environment Variables (Strictly Server-Side)

In Hostinger File Manager or Node.js configuration, create/update `.env`:

```env
# Hostinger MySQL Connection
DATABASE_URL="mysql://u123456789_fourfold_user:FourfoldArtisan#2026@localhost:3306/u123456789_thefourfold"

# Secret Authentication Keys (Kept strictly on the server)
BETTER_AUTH_SECRET="generate_a_long_random_64_character_secret"
ADMIN_SECRET_KEY="your_secret_studio_master_passcode"
ADMIN_EMAIL="artisan@thefourfold.com"

# Public Branding
NEXT_PUBLIC_STORE_NAME="The Fourfold"
NEXT_PUBLIC_STORE_TAGLINE="Handcrafted with Love, Folded to Cherish"
NEXT_PUBLIC_INSTAGRAM="https://instagram.com/thefourfold.official"
NEXT_PUBLIC_WHATSAPP="+919876543210"
NEXT_PUBLIC_UPI_ID="thefourfold@oksbi"
NEXT_PUBLIC_UPI_NAME="The Fourfold Craft Studio"
```

> **Security Note:** None of the database credentials or auth secrets are prefixed with `NEXT_PUBLIC_`. Next.js strictly compiles these only into the private server runtime, guaranteeing that no database passwords or admin secrets ever leak into client browser JavaScript.

---

## 3. Setup Hostinger Node.js Application

1. In hPanel, go to **Advanced** ➔ **Node.js**.
2. Click **Create Application**:
   - **Node.js Version:** Select `20.x` or `22.x`
   - **Application Root:** `/home/u123456789/domains/thefourfold.com/public_html`
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

# Seed initial categories, subcategories, handcrafted products, and admin user
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

## 6. Accessing the Secret Admin Vault

The non-technical craft team can manage all products, subcategories, pricing, stock, and orders directly via the secret portal:

- **Secret Portal URL:** `https://yourdomain.com/admin/login`
- **Master Passcode:** Defined in `ADMIN_SECRET_KEY` in your `.env`
- **Default Artisan Login:** `artisan@thefourfold.com` / `thefourfold_admin_2026`

Artisans can:
- Add new items with titles, photos, craft days, materials, and customization switches.
- Create new categories and subcategories dynamically.
- View customer personal notes and wax seal choices.
- Update tracking numbers and courier partner info in one click.
