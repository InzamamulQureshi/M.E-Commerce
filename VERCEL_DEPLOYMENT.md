# Vercel Deployment Guide

This guide explains how to deploy **M.E-Commerce** on **Vercel** with a remote **MySQL** database.

---

## Architecture

- **Application**: Next.js 14 running on Vercel Serverless Functions and Edge Network.
- **Database**: Remote MySQL 8.0+ instance (Vercel is stateless and does not host databases).
- **ORM**: Prisma 5 with connection pooling parameters.
- **Payments**: Razorpay Node SDK and Manual UPI QR with UTR verification.
- **Emails**: Resend API using React Email templates.

---

## 1. Remote MySQL Database Setup

Because Vercel serverless functions do not maintain persistent database connections, choose a managed or VPS-hosted MySQL database.

### Option A: Dokploy on VPS (Self-Hosted)
1. On your VPS Dokploy dashboard, go to **Databases** ➔ **Create Database** ➔ **MySQL**.
2. Create your database (`mecommerce`) and user with a strong password.
3. Expose port `3306`.
4. Connection string:
   ```
   mysql://USER:PASSWORD@YOUR_VPS_IP:3306/mecommerce?connection_limit=5&pool_timeout=30
   ```

### Option B: Railway
1. Sign in to [railway.app](https://railway.app).
2. Create a new project and provision **MySQL**.
3. Under the **Connect** tab, copy the public connection URL.
4. Append `?connection_limit=5` to the URL.

### Option C: TiDB Cloud (Serverless)
1. Create a free cluster on [tidbcloud.com](https://tidbcloud.com).
2. Copy the connection string provided for Prisma.

### Option D: Hostinger Remote MySQL
1. In Hostinger hPanel, go to **Databases** ➔ **MySQL Databases** and create a database and user.
2. In **Databases** ➔ **Remote MySQL**, add `%` (wildcard) to the whitelist to allow connections from Vercel's serverless IP pool.
3. Connection string:
   ```
   mysql://USER:PASSWORD@YOUR_DOMAIN_OR_HOSTINGER_IP:3306/DATABASE_NAME?connection_limit=5
   ```

---

## 2. Initialize the Database

Before launching on Vercel, push the schema tables and optional seed data from your local machine:

```bash
# Push tables to the remote database
DATABASE_URL="your_remote_mysql_url" npm run db:push

# (Optional) Seed default categories, products, admin, and settings
DATABASE_URL="your_remote_mysql_url" npm run db:seed
```

---

## 3. Import Project to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com) and click **Add New...** ➔ **Project**.
2. Select your GitHub repository (`InzamamulQureshi/M.E-Commerce`).
3. Keep default settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `next build` *(Prisma client generation runs via `postinstall` automatically)*
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

---

## 4. Set Environment Variables

In the **Environment Variables** panel in Vercel, configure the following:

### Core / Required

| Key | Example Value | Description |
|---|---|---|
| `DATABASE_URL` | `mysql://user:pass@host:3306/db?connection_limit=5&pool_timeout=30` | Remote MySQL URL with pooling limits. |
| `BETTER_AUTH_SECRET` | `long_random_64_character_string` | Secret used to sign JWT auth cookies. |
| `ADMIN_SECRET_KEY` | `YourSecureAdminPasscode2026` | Master admin passcode for dashboard login. |
| `ADMIN_EMAIL` | `admin@mecommerce.dev` | Admin login email. |
| `NEXT_PUBLIC_STORE_NAME` | `M.E-Commerce` | Store title shown in navigation and metadata. |

### Optional: Payments, Emails & Branding

| Key | Example Value | Description |
|---|---|---|
| `NEXT_PUBLIC_STORE_TAGLINE` | `Modern E-Commerce Studio` | Subtitle for hero and meta tags. |
| `NEXT_PUBLIC_SITE_URL` | `https://yourstore.com` | Production URL for OpenGraph previews. |
| `NEXT_PUBLIC_UPI_ID` | `store@oksbi` | UPI VPA for dynamic QR code payments. |
| `NEXT_PUBLIC_UPI_NAME` | `Store Studio` | Payee name shown during UPI payments. |
| `NEXT_PUBLIC_WHATSAPP` | `+919876543210` | WhatsApp customer support number. |
| `NEXT_PUBLIC_INSTAGRAM` | `https://instagram.com/store` | Instagram profile URL. |
| `RAZORPAY_KEY_ID` | `rzp_live_...` | Razorpay Key ID (Server-side). |
| `RAZORPAY_KEY_SECRET` | `...` | Razorpay Secret Key for HMAC signature check. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_live_...` | Razorpay Key ID for client checkout modal. |
| `RESEND_API_KEY` | `re_...` | Resend API key for sending emails. |
| `EMAIL_FROM` | `Store <orders@yourdomain.com>` | Verified sender address in Resend. |
| `ENABLE_DEMO_ADMIN` | `"false"` | Keep `"false"` in production. |
| `NEXT_PUBLIC_ENABLE_DEMO_ADMIN` | `"false"` | Keep `"false"` in production. |
| `ENABLE_DEMO_OTP` | `"false"` | Keep `"false"` in production. |
| `NEXT_PUBLIC_ENABLE_DEMO_OTP` | `"false"` | Keep `"false"` in production. |

---

## 5. Deploy & Verify

1. Click **Deploy**. Vercel will install dependencies, generate the Prisma client, and run `next build`.
2. Once the build completes, test the live deployment:
   - **Storefront**: Check that products and categories render properly.
   - **Admin Login**: Visit `/admin/login` and authenticate with `ADMIN_EMAIL` and `ADMIN_SECRET_KEY`.
   - **Favicon**: Visit `/api/branding/favicon.svg` to check dynamic SVG icon serving.
   - **OpenGraph**: Visit `/api/branding/og-image.png` to confirm dynamic billboard card generation.

---

## 6. Custom Domain Setup

1. In Vercel, go to **Settings** ➔ **Domains**.
2. Add your domain (e.g. `yourstore.com` and `www.yourstore.com`).
3. Add the following DNS records at your domain registrar:
   - **A Record**:
     - Host: `@`
     - Points to: `76.76.21.21`
   - **CNAME Record**:
     - Host: `www`
     - Points to: `cname.vercel-dns.com`
4. SSL certificates are provisioned and renewed automatically by Vercel.

---

## Troubleshooting

### Connection Timeouts (`ETIMEDOUT` / `P1001`)
- Verify port `3306` is open on your database server's firewall.
- If using Hostinger or cPanel, ensure `%` is added to Remote MySQL access hosts.
- Always include `?connection_limit=5` in `DATABASE_URL` to avoid exhausting MySQL connections.

### Emails Not Sending to Non-Owner Addresses
- Free Resend accounts restrict sending to the registered account owner's email until a custom domain is verified.
- To send to all customers, go to [resend.com/domains](https://resend.com/domains), add your domain, configure the DNS records, and update `EMAIL_FROM` with your verified domain.
