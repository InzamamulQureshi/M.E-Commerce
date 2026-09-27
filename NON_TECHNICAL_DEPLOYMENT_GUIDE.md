# Beginner's Deployment Guide (Plain English)

This guide is written for store owners, entrepreneurs, and clients who want to launch their store online without a technical background.

![Storefront](./homepage_preview.png)

---

## 1. How Your Website Works (Real-World Analogy)

Think of your online store like opening a physical retail boutique:

| Online Component | Real-World Equivalent | What It Does | Recommended Service |
|---|---|---|---|
| **Domain Name** | Your Store Sign & Address | The web address customers type in (e.g. `www.yourbrand.com`). | Namecheap, GoDaddy, Hostinger |
| **Website Hosting** | Your Storefront Building | The server that shows your pages, products, and checkout to visitors. | **Vercel** (Free tier available) |
| **Database** | Your Filing Cabinet & Warehouse | Securely stores your customer list, orders, inventory counts, and passwords. | **Dokploy VPS** or **Railway** |
| **Email Service** | Your Mail Courier | Automatically sends order confirmation receipts and 6-digit login codes. | **Resend** (Free 3,000 emails/month) |
| **Payment Gateway** | Your Card Machine & UPI QR | Collects money from cards, netbanking, and UPI apps into your bank account. | **Razorpay** |

### How the Pieces Connect

```mermaid
graph LR
    Customer((Customer)) -->|Visits yourstore.com| Vercel[Vercel: Storefront Hosting]
    Vercel -->|Saves orders & loads products| DB[(MySQL Database)]
    Vercel -->|Sends OTP & Order Receipts| Resend[Resend: Email Service]
    Vercel -->|Processes Card & UPI Payments| Razorpay[Razorpay: Payment Gateway]
```

---

## 2. Checklist: Accounts You Need

Before starting, create free accounts on these platforms (all offer free tiers):

1. **GitHub** ([github.com](https://github.com)): Holds your website code.
2. **Vercel** ([vercel.com](https://vercel.com)): Hosts and runs your website.
3. **Database Provider** (Choose one):
   - **Railway** ([railway.app](https://railway.app)): Easiest 1-click cloud database.
   - **Dokploy / Hostinger VPS**: Best if you already have a private VPS server.
4. **Resend** ([resend.com](https://resend.com)): Sends order emails and login verification codes.
5. **Razorpay** ([razorpay.com](https://razorpay.com)): Accepts Indian customer payments (Cards, UPI, Netbanking).

---

## 3. Step-by-Step Deployment

### Step 1: Create Your Database (5 Minutes)

Your store needs a MySQL database to remember products, customers, and orders.

#### Using Railway (Fastest Cloud Setup)
1. Go to [railway.app](https://railway.app) and sign in using your GitHub account.
2. Click **+ New Project** ➔ select **Provision MySQL**.
3. Once the database card appears, click on it and select the **Connect** tab.
4. Under **Connect External**, copy the **Database URL**. It looks like this:
   ```
   mysql://root:secretpassword@roundhouse.proxy.rlwy.net:12345/railway
   ```
5. Add `?connection_limit=5` to the very end of that link so it handles web traffic smoothly:
   ```
   mysql://root:secretpassword@roundhouse.proxy.rlwy.net:12345/railway?connection_limit=5
   ```
6. Save this link in a safe text file on your computer.

---

### Step 2: Initialize Your Database (One-Time Setup)

To create the store tables and demo products, run two commands from your computer terminal (or ask your developer):

```bash
# 1. Create the database tables
DATABASE_URL="your_copied_database_link" npm run db:push

# 2. Add sample products, categories, and settings
DATABASE_URL="your_copied_database_link" npm run db:seed
```

---

### Step 3: Connect Your Website to Vercel (5 Minutes)

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** (top right) ➔ select **Project**.
3. You will see a list of your GitHub projects. Find `M.E-Commerce` and click **Import**.
4. Leave the default settings as they are:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`

---

### Step 4: Fill in Your Store Settings (Environment Variables)

Before clicking Deploy, look down at the section named **Environment Variables**. This is where you paste your store configuration so the website knows how to reach your database and payment accounts.

Click **Environment Variables** and add the following:

#### Required Settings:
- `DATABASE_URL` ➔ Paste your database link from Step 1.
- `BETTER_AUTH_SECRET` ➔ Type any long, random 64-character phrase (e.g. `my_super_secure_store_secret_phrase_2026_random_keys_xyz`).
- `ADMIN_SECRET_KEY` ➔ Choose a secret admin passcode only you know (used to log into your dashboard).
- `ADMIN_EMAIL` ➔ Enter your primary email address (e.g. `admin@yourstore.com`).
- `NEXT_PUBLIC_STORE_NAME` ➔ The name of your brand (e.g. `The Fourfold`).

#### Payments & Contact:
- `NEXT_PUBLIC_UPI_ID` ➔ Your UPI ID for QR payments (e.g. `yourbrand@oksbi`).
- `NEXT_PUBLIC_UPI_NAME` ➔ Payee name displayed in UPI apps.
- `NEXT_PUBLIC_WHATSAPP` ➔ Support WhatsApp number (e.g. `+919876543210`).
- `RAZORPAY_KEY_ID` ➔ Your Razorpay Key ID (from Razorpay Dashboard ➔ Settings ➔ API Keys).
- `RAZORPAY_KEY_SECRET` ➔ Your Razorpay Key Secret.
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` ➔ Same as `RAZORPAY_KEY_ID`.

#### Email Receipts:
- `RESEND_API_KEY` ➔ Your API Key from [resend.com/api-keys](https://resend.com/api-keys).
- `EMAIL_FROM` ➔ `Your Brand <orders@yourdomain.com>` (or `onboarding@resend.dev` during initial testing).

#### Safety Controls:
- `ENABLE_DEMO_ADMIN` ➔ Set to `false`.
- `NEXT_PUBLIC_ENABLE_DEMO_ADMIN` ➔ Set to `false`.
- `ENABLE_DEMO_OTP` ➔ Set to `false`.
- `NEXT_PUBLIC_ENABLE_DEMO_OTP` ➔ Set to `false`.

---

### Step 5: Click Deploy!

1. Click the blue **Deploy** button.
2. Vercel will build your website. This takes about 1 to 2 minutes.
3. Once completed, confetti will appear on screen with your live store link (e.g. `https://your-store.vercel.app`).
4. Click the link to open your live store.

---

### Step 6: Connect Your Custom Domain (`www.yourbrand.com`)

1. In your Vercel project page, go to **Settings** ➔ **Domains**.
2. Type in your domain name (e.g. `yourbrand.com`) and click **Add**.
3. Vercel will ask you to add two DNS records at the website where you purchased your domain (GoDaddy, Namecheap, Hostinger):
   - **A Record**: Host `@` pointing to `76.76.21.21`
   - **CNAME Record**: Host `www` pointing to `cname.vercel-dns.com`
4. Within 10 to 15 minutes, your domain will be connected with a free, automatic SSL security padlock.

---

## 4. First Things to Do After Launch

![Admin Dashboard](./admin_dashboard_settings_tabs.png)

1. **Log in to Admin**:
   Visit `https://yourdomain.com/admin/login` and log in with your `ADMIN_EMAIL` and `ADMIN_SECRET_KEY`.
2. **Update Store Branding**:
   Go to **Settings** ➔ **Branding** to customize your store name, logo size, tagline, and contact info.
3. **Set Up Shipping Rates**:
   Go to **Settings** ➔ **Shipping** to configure free shipping thresholds and delivery fees.
   ![Shipping Settings](./settings_shipping_preview.png)
4. **Add Your Products**:
   Go to **Products** ➔ **+ Add Product** to upload photos, descriptions, and prices.
5. **Test a Checkout**:
   Go to your storefront, add a product to cart, and test checkout with Cash on Delivery or UPI QR to verify order emails.

---

## 5. Frequently Asked Questions

### Where do customer payments go?
- **Razorpay**: Payments go directly into your connected business bank account on Razorpay's payout schedule (usually T+1 or T+2 days).
- **UPI QR**: Customers pay straight into your bank UPI VPA. You verify their 12-digit transaction number (UTR) in the Admin Orders tab before shipping.
- **Cash on Delivery (COD)**: Your delivery courier collects cash from the customer at their doorstep.

### How do I change product prices or banner text?
You do not need to touch any code. Log into `/admin/dashboard`, click **Products** or **Settings**, make your changes, and click **Save Changes**. The storefront updates immediately.

### Why didn't a customer receive their login OTP email?
1. Ask the customer to check their **Spam**, **Junk**, or **Promotions** folder.
2. If you are using Resend's free trial without a verified domain, Resend only sends emails to your own email address. Go to [resend.com/domains](https://resend.com/domains), add your custom domain, and add the DNS records provided by Resend.
