# 🚀 Database Setup Guide

Your code has been pushed to GitHub! Now you need to create the database tables in Supabase.

## ✅ What's Already Done

- ✅ Code committed and pushed to GitHub
- ✅ Supabase environment variables configured in `.env.local`
- ✅ Migration scripts created

## 📋 Next Steps: Run SQL Migrations in Supabase

### Step 1: Open Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project (think-abc-sales or similar)

### Step 2: Run Migration 1 - Users Table (If Not Already Run)

This may already be done from Week 2 Session 1. To check:

1. Click **"Table Editor"** in the left sidebar
2. Look for a table called **"users"**
3. If it exists, skip to Step 3. If not, continue:

4. Click **"SQL Editor"** in the left sidebar
5. Click **"New Query"**
6. Copy and paste the contents of `supabase/migrations/001_users_table.sql`
7. Click **"Run"** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
8. You should see: `Success. No rows returned`

### Step 3: Run Migration 2 - Calls Table

1. In **SQL Editor**, click **"New Query"**
2. Copy the contents of `supabase/migrations/002_calls_table.sql`:
   ```bash
   # On your terminal, you can view it with:
   cat supabase/migrations/002_calls_table.sql
   ```
3. Paste into the SQL Editor
4. Click **"Run"** or press `Ctrl+Enter` / `Cmd+Enter`
5. You should see: `Success. No rows returned`

### Step 4: Run Migration 3 - Clients & Campaigns Tables

1. In **SQL Editor**, click **"New Query"**
2. Copy the contents of `supabase/migrations/003_clients_campaigns_tables.sql`:
   ```bash
   # On your terminal:
   cat supabase/migrations/003_clients_campaigns_tables.sql
   ```
3. Paste into the SQL Editor
4. Click **"Run"**
5. You should see: `Success. No rows returned`

### Step 5: Verify Tables Created

1. Click **"Table Editor"** in the left sidebar
2. You should now see these tables:
   - ✅ **users**
   - ✅ **calls**
   - ✅ **clients**
   - ✅ **campaigns**

3. Click on each table to verify the columns exist:

   **users table should have:**
   - id, email, password_hash, name, role, team, plan, status, created_at, last_login, avatar_url

   **calls table should have:**
   - id, user_id, team, agent_name, prospect_name, transcript, score, summary, strengths, improvements, tone, emotional_intelligence, created_at, updated_at

   **clients table should have:**
   - id, user_id, company_name, contact_name, email, phone, plan, status, subscription_id, created_date, last_active, total_users, monthly_revenue, created_at, updated_at

   **campaigns table should have:**
   - id, user_id, name, status, start_date, end_date, total_calls, avg_score, revenue, team_members, description, goals, metrics, created_at, updated_at

## 🧪 Test Your Setup

### Test 1: User Authentication

1. Open your app: `npm run dev`
2. Navigate to `http://localhost:5173`
3. Try signing up with a new account
4. Check browser console for: `✅ User created in Supabase`
5. Go to Supabase → Table Editor → users
6. You should see your new user row!

### Test 2: Call Analysis

1. In your app, navigate to **Call Analysis**
2. Paste a sample call transcript:
   ```
   Sales Rep: Hi, this is John from TechCorp. How are you today?
   Prospect: I'm good, thanks.
   Sales Rep: Great! I wanted to reach out about our new software solution...
   ```
3. Click **"Analyze Call"**
4. Check browser console for: `✅ Call saved to Supabase database`
5. Go to Supabase → Table Editor → calls
6. You should see your call record!

### Test 3: Client Management

1. Navigate to **Client Management**
2. Click **"Add Client"**
3. Fill in details:
   - Company Name: "Test Corp"
   - Email: "test@example.com"
   - Plan: "Team Plan"
4. Click **"Create"**
5. Check console for: `✅ Client created in Supabase`
6. Go to Supabase → Table Editor → clients
7. You should see your client!

## 🎉 You're All Set!

Once you see data in your Supabase tables, everything is working!

### What You Can Now Do:

- ✅ Unlimited call storage (no more 50-call limit!)
- ✅ Access your data from any device
- ✅ Data persists even if you clear your browser
- ✅ Team collaboration features enabled
- ✅ Professional database with backups

## 🐛 Troubleshooting

### Issue: Tables don't appear after running SQL

**Solution:**
1. Check for errors in the SQL Editor output
2. Make sure you ran ALL three migration scripts
3. Try refreshing the Table Editor page

### Issue: "Row Level Security policy violation"

**Solution:**
1. This means RLS is working correctly!
2. You need to be authenticated to insert/view data
3. Make sure you're logged in to your app
4. The `user_id` must match your authenticated user

### Issue: Console shows "Supabase unavailable"

**Solution:**
1. Check your `.env.local` file has correct values
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Restart your dev server: `npm run dev`

### Issue: Data not syncing

**Solution:**
1. Check browser console for errors
2. Verify Supabase project is not paused (free tier pauses after inactivity)
3. Check your internet connection

## 📚 Next Steps

After database setup is complete:

1. **Test all features** - Try creating calls, clients, campaigns
2. **Monitor Supabase Dashboard** - Watch data populate in real-time
3. **Continue to Week 2 Session 4** - Build analytics dashboard
4. **Invite team members** - Share the app and test multi-user

## 🔗 Useful Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase SQL Editor Documentation](https://supabase.com/docs/guides/database/overview)
- [Your GitHub Repository](https://github.com/charlieunitedcs-byte/New-Ideas-ThinkALM)
- Week 2 Session 1 Summary: `WEEK2_SESSION1_SUMMARY.md`
- Week 2 Session 2 Summary: `WEEK2_SESSION2_SUMMARY.md`
- Week 2 Session 3 Summary: `WEEK2_SESSION3_SUMMARY.md`

---

**Need Help?** Check the session summaries for detailed documentation and testing guides!
