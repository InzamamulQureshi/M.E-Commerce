# Hostinger Deployment Guide

This guide covers deploying **M.E-Commerce** on **Hostinger VPS** (recommended) or **Hostinger Shared/Cloud Web Hosting**.

---

## Method 1: Hostinger VPS (Recommended)

Using a VPS with Dokploy or Docker provides dedicated server resources and eliminates serverless database connection limits.

### 1. Connect to VPS
```bash
ssh root@YOUR_VPS_IP
```

### 2. Install Dokploy (Application & Database Manager)
```bash
curl -sSL https://dokploy.com/install.sh | sh
```
Open `http://YOUR_VPS_IP:3000` to set up your Dokploy administrator account.

### 3. Create MySQL Database in Dokploy
1. In Dokploy, go to **Databases** ➔ **Create Database** ➔ **MySQL**.
2. Set database name (`mecommerce`), user (`mecommerce_user`), and password.
3. Expose port `3306` if connecting from external tools.
4. Database connection string:
   ```
   mysql://mecommerce_user:YOUR_PASSWORD@localhost:3306/mecommerce?connection_limit=10&pool_timeout=30
   ```

### 4. Deploy the Application
1. In Dokploy, go to **Applications** ➔ **Create Application**.
2. Connect your GitHub repository (`InzamamulQureshi/M.E-Commerce`), branch `main`.
3. Set Build Type to `Nixpacks` or `Dockerfile`.
4. Add your production environment variables (see below).
5. In **Domains**, enter your domain name. Dokploy automatically generates a free Let's Encrypt SSL certificate.
6. Click **Deploy**.

---

## Method 2: Hostinger Shared/Cloud Hosting (hPanel)

If you are using Hostinger Web Hosting with hPanel and Node.js support:

### 1. Create MySQL Database
1. In hPanel, go to **Databases** ➔ **MySQL Databases**.
2. Create a new database:
   - Database Name: `u123456789_mecommerce`
   - Username: `u123456789_mecommerce_user`
   - Password: `your_strong_password`
3. Connection string format:
   ```
   mysql://u123456789_mecommerce_user:your_strong_password@localhost:3306/u123456789_mecommerce
   ```

### 2. Configure Node.js Application
1. In hPanel, go to **Advanced** ➔ **Node.js**.
2. Click **Create Application**:
   - Node.js Version: `20.x`
   - Application Root: `/home/u123456789/domains/yourdomain.com/public_html`
   - Application Mode: `Production`
3. Upload project files (via Git integration or File Manager).
4. In Web Terminal or SSH:
   ```bash
   npm install
   ```

### 3. Initialize Database
```bash
# Push schema tables
npm run db:push

# (Optional) Seed initial data
npm run db:seed
```

### 4. Build and Start
```bash
npm run build
npm run start
```
In hPanel, click **Restart Application**.

---

## Production Environment Variables

Configure these in your Dokploy application or Hostinger `.env` file:

```env
# Database
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE?connection_limit=10&pool_timeout=30"

# Authentication Secrets
BETTER_AUTH_SECRET="long_random_64_character_string"
ADMIN_SECRET_KEY="your_secure_admin_passcode"
ADMIN_EMAIL="admin@mecommerce.dev"

# Store Information
NEXT_PUBLIC_STORE_NAME="M.E-Commerce"
NEXT_PUBLIC_STORE_TAGLINE="Modern E-Commerce Studio"
NEXT_PUBLIC_SITE_URL="https://yourstore.com"
NEXT_PUBLIC_UPI_ID="store@oksbi"
NEXT_PUBLIC_UPI_NAME="Store Studio"
NEXT_PUBLIC_WHATSAPP="+919876543210"
NEXT_PUBLIC_INSTAGRAM="https://instagram.com/store"

# Payment Gateways (Razorpay)
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="your_razorpay_secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_..."

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="Store <orders@yourstore.com>"

# Production Flags
ENABLE_DEMO_ADMIN="false"
NEXT_PUBLIC_ENABLE_DEMO_ADMIN="false"
ENABLE_DEMO_OTP="false"
NEXT_PUBLIC_ENABLE_DEMO_OTP="false"
```

---

## SSL Configuration

1. In Hostinger hPanel, go to **Security** ➔ **SSL**.
2. Select your domain and install the free Let's Encrypt certificate.
3. Enable **Force HTTPS**.

---

## Admin Portal Access

Once deployed, access the admin dashboard at:
- **URL**: `https://yourstore.com/admin/login`
- **Master Passcode**: Value of `ADMIN_SECRET_KEY` in `.env`
- **Default Account**: `admin@mecommerce.dev` / `mecommerce_admin_2026`
