# Supabase Setup Instructions

## Step 1: Create Supabase Account & Project

### 1.1 Sign Up for Supabase

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub (recommended) or Email
4. You'll be taken to your dashboard

### 1.2 Create New Project

1. Click "New Project" button
2. Fill in the form:
   - **Name:** `think-abc-sales` (or any name you prefer)
   - **Database Password:** Click "Generate a password" and **SAVE IT SOMEWHERE SAFE**
   - **Region:** Choose the region closest to your users
     - For US: `us-east-1` (Virginia) or `us-west-1` (California)
     - For Europe: `eu-west-1` (Ireland)
     - For Asia: `ap-southeast-1` (Singapore)
   - **Pricing Plan:** Free (perfect for starting - includes 500MB storage, unlimited API requests)

3. Click "Create new project"
4. **Wait 2-3 minutes** for the project to be created (you'll see a progress indicator)

---

## Step 2: Get Your API Credentials

Once your project is ready:

### 2.1 Navigate to API Settings

1. In your Supabase project dashboard, click on the **Settings** icon (⚙️) in the left sidebar
2. Click **API** in the settings menu

### 2.2 Copy Your Credentials

You'll see several values. Copy these **THREE** items:

**1. Project URL:**
```
https://xxxxxxxxxxxxx.supabase.co
```

**2. anon/public key** (under "Project API keys"):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4IiwiXXXXXX...
```

**3. service_role key** (under "Project API keys" - click "Reveal" button):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4IiwiXXXXXX...
```

⚠️ **IMPORTANT:**
- The `anon` key is safe for frontend (public)
- The `service_role` key is SECRET - NEVER expose in frontend code
- The `service_role` key bypasses Row Level Security - use only in backend

---

## Step 3: Add Credentials to Your Project

### 3.1 Open `.env.local` File

In your project folder: `/Users/charliebailey/Downloads/think-alm-sales (3)/.env.local`

### 3.2 Add These Lines

Add the following to your `.env.local` file (replace with your actual values):

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Explanation:**
- `VITE_SUPABASE_URL` - Your project URL (frontend-safe, starts with `VITE_` so Vite bundles it)
- `VITE_SUPABASE_ANON_KEY` - Public key for frontend (frontend-safe)
- `SUPABASE_SERVICE_ROLE_KEY` - Secret key for backend only (NOT prefixed with `VITE_`)

### 3.3 Save the File

Make sure you save `.env.local` after adding these variables.

---

## Step 4: Create Database Schema

Now we'll create the `users` table in your Supabase database.

### 4.1 Open SQL Editor

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query** button

### 4.2 Paste This SQL

Copy and paste this entire SQL script:

```sql
-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ADMIN',
  team TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'INDIVIDUAL',
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  avatar_url TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_team ON users(team);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Add Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Policy: Service role can do anything (for backend API)
CREATE POLICY "Service role has full access"
  ON users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add comment for documentation
COMMENT ON TABLE users IS 'User accounts for Think ABC Sales Platform';
```

### 4.3 Run the Query

1. Click the **Run** button (or press `Ctrl+Enter` / `Cmd+Enter`)
2. You should see: "Success. No rows returned"

### 4.4 Verify Table Created

1. Click **Table Editor** in the left sidebar
2. You should see `users` table listed
3. Click on it to see the empty table with columns:
   - id
   - email
   - password_hash
   - name
   - role
   - team
   - plan
   - status
   - created_at
   - last_login
   - avatar_url

---

## Step 5: Verify Everything Works

### 5.1 Check Environment Variables

In your terminal, run:

```bash
cd /Users/charliebailey/Downloads/think-alm-sales\ \(3\)
cat .env.local | grep SUPABASE
```

You should see your three Supabase variables.

### 5.2 Test Connection (Optional)

You can test the connection by inserting a test user directly in Supabase:

1. Go to **Table Editor** → `users`
2. Click **Insert row**
3. Fill in:
   - email: `test@example.com`
   - password_hash: `dummy_hash_for_testing`
   - name: `Test User`
   - team: `Test Team`
4. Click **Save**
5. You should see the new row appear

**Delete this test user** after verifying (click the row → Delete).

---

## Common Issues & Solutions

### Issue 1: "Project is not ready yet"
**Solution:** Wait 2-3 minutes. Supabase takes time to provision the database.

### Issue 2: "Error: relation 'users' does not exist"
**Solution:** The SQL query didn't run. Go back to SQL Editor and run it again.

### Issue 3: "Authentication failed"
**Solution:** Double-check you copied the correct API keys from Settings → API.

### Issue 4: "VITE_SUPABASE_URL is undefined"
**Solution:** Make sure environment variables start with `VITE_` for frontend access.
**Solution:** Restart dev server after adding .env.local variables: `npm run dev`

---

## Next Steps

Once you've completed all 5 steps above:

1. **Confirm** you have:
   - ✅ Supabase account created
   - ✅ Project created and ready
   - ✅ API credentials copied to `.env.local`
   - ✅ `users` table created in database
   - ✅ Table verified in Table Editor

2. **Let me know** you're ready, and I'll:
   - Install the Supabase JavaScript client
   - Create the Supabase service
   - Migrate authentication to use the database
   - Test everything works

---

## Security Notes

✅ **Safe to commit:**
- `.env.example` (template with placeholder values)

❌ **NEVER commit:**
- `.env.local` (contains real API keys)
- `SUPABASE_SERVICE_ROLE_KEY` anywhere in frontend code

✅ **Where to use each key:**
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` → Frontend (public, safe)
- `SUPABASE_SERVICE_ROLE_KEY` → Backend API only (secret, admin access)

---

## Pricing Reminder

**Free Tier Limits:**
- 500 MB database storage
- 1 GB file storage
- 2 GB bandwidth/month
- 50,000 monthly active users
- Unlimited API requests
- 500 MB database backups

**When you'll need to upgrade:**
- 500+ active users → Pro plan ($25/month)
- Need more than 8 GB storage → Pro plan
- Need more bandwidth → Pro plan

For your real estate use case (100s of calls/week), the **free tier is perfect** for the first 6-12 months.

---

**Ready? Let me know once you've completed Steps 1-5!**

Type: **"Supabase is set up"** or **"Ready"** when done, and I'll continue with the code integration.
