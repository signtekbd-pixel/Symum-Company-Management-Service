# PrintERP - Deployment Guide

## Quick Start (5 minutes)

### Step 1: Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" → Sign up with GitHub
3. Click "New Project"
4. Fill in:
   - **Organization**: Create new or use existing
   - **Project name**: `prinerp`
   - **Database password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., `Southeast Asia` for Bangladesh)
5. Click "Create new project"
6. Wait 1-2 minutes for setup

### Step 2: Get Database Connection String
1. In Supabase dashboard → Click "Connect" (top bar)
2. Under "Connection string" → Click "URI"
3. Copy the connection string, it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
4. **Replace `[YOUR-PASSWORD]`** with the password you created in Step 1

### Step 3: Deploy to Vercel
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Find `Symum-Company-Management-Service` → Click "Import"
5. Before deploying, click "Environment Variables" and add:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Your Supabase connection string from Step 2 |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` (or any random 32+ char string) |
   | `NEXTAUTH_URL` | Your Vercel URL (e.g., `https://symum-company-management-service.vercel.app`) |

6. Click "Deploy"
7. Wait 1-2 minutes for deployment

### Step 4: Initialize Database Tables
After Vercel deployment succeeds:

1. Go to your Vercel project → Settings → Environment Variables
2. Make sure all 3 variables are set
3. Open Supabase SQL Editor (left sidebar → SQL Editor)
4. Run this SQL to create all tables:

```sql
-- The tables will be created by Prisma on first build
-- Or run locally: npx prisma db push
```

### Step 5: Seed Demo Data
After tables are created, run locally against production DB:

```bash
# Update your local .env with production DATABASE_URL
# Then run:
npx prisma db push
npm run db:seed
```

---

## Login Credentials (after seeding)

| Email | Password | Role |
|-------|----------|------|
| admin@prinerp.com | admin123 | Super Admin |

---

## Troubleshooting

### Build fails on Vercel
- Check that `DATABASE_URL` doesn't have `%23` instead of `#`
- Make sure `NEXTAUTH_SECRET` is set (minimum 32 characters)

### Database connection error
- In Supabase → Settings → Database → Check "Pool Mode" is set to "Transaction"
- Make sure you replaced `[YOUR-PASSWORD]` in the connection string

### Pages show "Loading" forever
- Check browser console for errors
- Make sure NEXTAUTH_URL matches your actual Vercel URL
