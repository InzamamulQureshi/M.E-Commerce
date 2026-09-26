# Complete Vercel Production Deployment Guide

This guide provides end-to-end instructions for deploying **M.E-Commerce** on **Vercel** with a remote **MySQL** database, automated schema initialization, and custom domain setup.

---

## Architecture Overview

* **Frontend & Serverless API:** Hosted on Vercel (Edge Network + AWS Lambda Serverless Functions).
* **Database:** Hosted on an external MySQL provider (Vercel is stateless and does not host databases).
* **ORM:** Prisma 5 connects securely to your remote MySQL instance with connection pooling.
* **OpenGraph Image Engine:** `@resvg/resvg-js` natively rasterizes 1200×630 PNG billboard cards inside Vercel Serverless Functions.

---

## Phase 1: Choose & Create a Remote MySQL Database

Because Vercel does not provide MySQL directly, choose any managed or hosted MySQL database. Here are the most popular options:

### Option A: Railway (Recommended — Fastest 1-Click Setup)
1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** ➔ **Provision MySQL**.
3. Under the **Connect** tab, copy the **Public URL** or connection parameters.
4. Your connection string will look like:
   ```
   mysql://root:password@roundhouse.proxy.rlwy.net:12345/railway
   ```

### Option B: Aiven for MySQL (Free Cloud Managed MySQL)
1. Go to [aiven.io](https://aiven.io) and create a free MySQL service (AWS/GCP/Azure).
2. Download the CA certificate if SSL is strictly required or use the provided service URI.
3. Your connection string will look like:
   ```
   mysql://avnadmin:password@mysql-project.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED
   ```

### Option C: TiDB Cloud (Serverless MySQL)
1. Go to [tidbcloud.com](https://tidbcloud.com) and create a free **Serverless TiDB cluster** (fully MySQL-compatible).
2. Choose **Prisma** in the connection modal to get your connection string.

### Option D: Existing Web Hosting (Hostinger / cPanel / Plesk)
If using an existing cPanel or Hostinger MySQL database:
1. Log in to your hosting panel (hPanel / cPanel).
2. Go to **Databases** ➔ **Remote MySQL**.
3. Add `%` (wildcard) under **Access Host** to allow Vercel's dynamic serverless IP addresses to connect.
4. Make sure your database user has `ALL PRIVILEGES` on the database.
5. Your connection string will look like:
   ```
   mysql://u123456_user:password@yourdomain.com:3306/u123456_mecommerce
   ```

---

## Phase 2: Initialize & Seed the Remote Database

Before deploying to Vercel, populate the tables and initial demo catalog on your remote database.

From your local machine terminal:

```bash
# 1. Push all 16+ Prisma tables to your remote database
DATABASE_URL="your_remote_mysql_connection_url" npx prisma db push

# 2. Seed initial categories, demo products, default admin, and studio branding
DATABASE_URL="your_remote_mysql_connection_url" npm run db:seed
```

> [!TIP]
> You can also update the `DATABASE_URL` line inside your local `.env` temporarily and simply run:
> ```bash
> npm run db:push
> npm run db:seed
> ```

---

## Phase 3: Import Project to Vercel

1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click the **"Add New..."** button (top right) ➔ Select **Project**.
3. Under **Import Git Repository**, select `InzamamulQureshi/M.E-Commerce` (click *Install* if Vercel doesn't have GitHub permissions yet).
4. Configure the project:
   * **Project Name:** `m-e-commerce` (or your chosen brand name).
   * **Framework Preset:** `Next.js` (auto-detected).
   * **Root Directory:** `./` (default).
   * **Build Command:** Leave default (`next build`) OR set to `prisma db push && next build` if you want automatic schema synchronization on every Git push.
   * **Output Directory:** `.next` (auto-detected).
   * **Install Command:** `npm install` (auto-detected, automatically executes `"postinstall": "prisma generate"`).

---

## Phase 4: Configure Environment Variables in Vercel

In the **Environment Variables** section on Vercel, enter the following keys:

### 1. Database & Security Secrets (Server-Side Only)

| Variable Key | Example Value | Description |
|---|---|---|
| `DATABASE_URL` | `mysql://user:pass@host:3306/dbname?connection_limit=5` | Remote MySQL URL. Always include `?connection_limit=5` for serverless pooling. |
| `BETTER_AUTH_SECRET` | `8f4b2e6a9d1c7f3e5b8a0d2c4e6f8a1b3d5e7c9a0f2b4d6e8a1c3e5b7d9f0a2` | Random 64-character secret used to sign JWT session cookies. |
| `ADMIN_SECRET_KEY` | `YourMasterAdminSecretPasscode#2026` | Master passcode for admin authentication. |
| `ADMIN_EMAIL` | `admin@mecommerce.dev` | Admin account identifier. |

### 2. Public Storefront & Branding Variables (`NEXT_PUBLIC_`)

| Variable Key | Example Value | Description |
|---|---|---|
| `NEXT_PUBLIC_STORE_NAME` | `M.E-Commerce` | Store title shown in navigation and title tags. |
| `NEXT_PUBLIC_STORE_TAGLINE` | `Modern, Minimalist & Modular E-Commerce` | Subtitle for storefront and metadata. |
| `NEXT_PUBLIC_UPI_ID` | `mecommerce@oksbi` | UPI VPA for dynamic QR code payments. |
| `NEXT_PUBLIC_UPI_NAME` | `M.E-Commerce Studio` | Payee name displayed in banking apps. |
| `NEXT_PUBLIC_WHATSAPP` | `+919876543210` | WhatsApp support contact link. |
| `NEXT_PUBLIC_INSTAGRAM` | `https://instagram.com/mecommerce.official` | Instagram profile link. |

### 3. Demo Admin Preview (Disabled by Default — Opt-In Only)

| Variable Key | Example Value | Description |
|---|---|---|
| `ENABLE_DEMO_ADMIN` | `"true"` (Default: `"false"`) | Disabled by default. Set to `"true"` only if you want to enable the demo preview account on this deployment. |
| `NEXT_PUBLIC_ENABLE_DEMO_ADMIN` | `"true"` (Default: `"false"`) | Controls visibility of the "Explore Demo Admin" button on `/admin/login`. Disabled by default unless explicitly set to `"true"`. |
| `DEMO_ADMIN_EMAIL` | `demo@mecommerce.dev` | Demo account login identifier. |
| `DEMO_ADMIN_PASSWORD` | `demo` | Demo account password. |

### 4. Modular Payment Gateways (Razorpay & Extensible Stripe)

| Variable Key | Example Value | Description |
|---|---|---|
| `RAZORPAY_KEY_ID` | `rzp_live_...` or `rzp_test_...` | Razorpay Key ID (Server-side). Leave empty for seamless fallback to UPI QR & COD. |
| `RAZORPAY_KEY_SECRET` | `...` | Razorpay Secret Key for HMAC-SHA256 signature verification. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_live_...` | Client-accessible Razorpay Key ID for checkout modal. |
| `STRIPE_SECRET_KEY` | `sk_test_...` | (Optional) Stripe Secret Key for future Stripe activation. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | (Optional) Stripe Publishable Key. |

### 5. React Email System (Resend Provider)

| Variable Key | Example Value | Description |
|---|---|---|
| `RESEND_API_KEY` (or `REACT_EMAIL_SECRET_KEY`) | `re_123456789...` | API Key from resend.com. Leave empty to fallback to development state (console logs OTP & provides devCode). |
| `EMAIL_FROM` | `M.E-Commerce <orders@yourverifieddomain.com>` | Verified sender email address in Resend. |

---

## Phase 5: Deploy & Verify

1. Click the **Deploy** button.
2. Vercel will:
   * Clone the latest commit from GitHub (`main` branch).
   * Run `npm install` ➔ auto-generates typed Prisma client (`postinstall`).
   * Run `next build` ➔ compiles all 54 static and serverless routes.
3. In under 2 minutes, Vercel will provide your live deployment URL:
   `https://m-e-commerce.vercel.app`

### Post-Deployment Verification Steps:
* **Storefront:** Visit `https://your-app.vercel.app` and verify the catalog, hero, and theme switcher load properly.
* **Admin Portal:** Go to `https://your-app.vercel.app/admin/login` and log in with:
  * **Email:** `admin@mecommerce.dev` (or your configured `ADMIN_EMAIL`)
  * **Password:** `mecommerce_admin_2026`
  * **Master Passcode:** Your `ADMIN_SECRET_KEY`
* **Dynamic OpenGraph Engine:** Visit `https://your-app.vercel.app/api/branding/og-image.png` to confirm the 1200×630 raster PNG billboard renders dynamically without clipping.
* **Favicon:** Visit `https://your-app.vercel.app/api/branding/favicon.svg` to check your live SVG tab icon.

---

## Phase 6: Adding a Custom Domain

1. In your Vercel Project Dashboard, navigate to **Settings** ➔ **Domains**.
2. Enter your domain name (e.g. `yourstore.com`).
3. Add both `yourstore.com` and `www.yourstore.com`.
4. In your domain registrar (GoDaddy, Namecheap, Cloudflare, Hostinger):
   * Add an **A Record**:
     * **Name / Host:** `@`
     * **Value / Points to:** `76.76.21.21`
   * Add a **CNAME Record**:
     * **Name / Host:** `www`
     * **Value / Points to:** `cname.vercel-dns.com`
5. Vercel automatically provisions and renews a free **SSL / TLS Certificate** within 5–10 minutes.

---

## Best Practices & Troubleshooting for Vercel + Serverless MySQL

### 1. Avoid Connection Exhaustion
Serverless functions create connections on demand. Always append `?connection_limit=5` to your `DATABASE_URL`:
```env
DATABASE_URL="mysql://user:pass@host:3306/dbname?connection_limit=5"
```

### 2. Remote MySQL Whitelist Error (`ETIMEDOUT` / `Access denied`)
If Vercel logs show `Can't reach database server at ...`:
* Ensure your remote database host allows inbound connections on port `3306`.
* If using cPanel/Hostinger, verify that `%` is added to **Remote MySQL**.

### 3. Automatic Deployments on Git Push
Every time you push code to GitHub:
```bash
git push origin main
```
Vercel automatically triggers a zero-downtime production deployment. Any pull request automatically creates an isolated preview environment with its own URL.
