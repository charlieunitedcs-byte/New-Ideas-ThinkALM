# Week 2: Database Migration to Supabase

## Overview

**Goal:** Replace localStorage with Supabase PostgreSQL database for persistent, scalable data storage.

**Duration:** 3-4 sessions (6-8 hours)

**Current State:**
- All data stored in browser localStorage
- 50-call limit
- Data lost if user clears browser
- No multi-device sync
- No team collaboration

**Target State:**
- All data in Supabase PostgreSQL
- Unlimited storage
- Data persists across devices
- Multi-user support
- Real-time sync
- Admin dashboard with analytics

---

## Session 1: Supabase Setup & User Authentication

**Duration:** 2-3 hours

### Tasks:
1. ✅ Create Supabase project
2. ✅ Install Supabase client library
3. ✅ Create database schema (users table)
4. ✅ Create Supabase client service
5. ✅ Migrate user authentication to Supabase
6. ✅ Update backend auth endpoints
7. ✅ Test login/signup with database
8. ✅ Commit and document

### Database Schema (Session 1):

```sql
-- Users table
CREATE TABLE users (
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

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_team ON users(team);
```

### What Changes:

**Before (localStorage):**
```typescript
const accounts = JSON.parse(localStorage.getItem('think-abc-user-accounts') || '[]');
const user = accounts.find(a => a.email === email);
```

**After (Supabase):**
```typescript
const { data: user, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single();
```

---

## Session 2: Call History Migration

**Duration:** 2-3 hours

### Tasks:
1. Create calls table schema
2. Create call analysis service with Supabase
3. Migrate existing calls from localStorage to database
4. Update Call History page to use Supabase
5. Implement pagination (50 calls per page)
6. Add search and filter functionality
7. Test and commit

### Database Schema (Session 2):

```sql
-- Calls table
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team TEXT NOT NULL,
  agent_name TEXT,
  prospect_name TEXT,
  transcript TEXT NOT NULL,
  score INTEGER NOT NULL,
  summary TEXT,
  strengths JSONB,
  improvements JSONB,
  tone TEXT,
  emotional_intelligence INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_team ON calls(team);
CREATE INDEX idx_calls_created_at ON calls(created_at DESC);
```

### Benefits:
- No 50-call limit
- Search across all calls
- Filter by date, score, agent, etc.
- Export call history
- Team-wide call visibility

---

## Session 3: Clients & Campaigns Migration

**Duration:** 2-3 hours

### Tasks:
1. Create clients and campaigns tables
2. Migrate client data from localStorage
3. Migrate campaign data from localStorage
4. Update Clients page to use Supabase
5. Update Campaigns page to use Supabase
6. Add client activity tracking
7. Test and commit

### Database Schema (Session 3):

```sql
-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  status TEXT DEFAULT 'Prospecting',
  last_contact TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'Draft',
  start_date DATE,
  end_date DATE,
  target_audience TEXT,
  goals JSONB,
  metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
```

---

## Session 4 (Optional): Analytics & Admin Dashboard

**Duration:** 2-3 hours

### Tasks:
1. Create analytics queries
2. Build admin dashboard component
3. Add real-time user count
4. Add API usage tracking
5. Add call volume charts
6. Add team performance metrics
7. Test and commit

### Analytics Queries:

```sql
-- Total users
SELECT COUNT(*) FROM users;

-- New users this week
SELECT COUNT(*) FROM users
WHERE created_at > NOW() - INTERVAL '7 days';

-- Total calls analyzed
SELECT COUNT(*) FROM calls;

-- Average call score
SELECT AVG(score) FROM calls;

-- Top performing agents
SELECT agent_name, AVG(score) as avg_score, COUNT(*) as call_count
FROM calls
GROUP BY agent_name
ORDER BY avg_score DESC
LIMIT 10;

-- API usage per user
SELECT u.email, COUNT(c.id) as calls_analyzed
FROM users u
LEFT JOIN calls c ON u.id = c.user_id
GROUP BY u.email
ORDER BY calls_analyzed DESC;
```

---

## Week 2 Benefits Summary

### Storage:
- ❌ Before: 5-10 MB localStorage limit
- ✅ After: Unlimited database storage

### Data Persistence:
- ❌ Before: Lost if browser cleared
- ✅ After: Permanent database storage

### Scalability:
- ❌ Before: 50-call limit per user
- ✅ After: Unlimited calls

### Multi-Device:
- ❌ Before: Data stuck on one browser
- ✅ After: Access from any device

### Team Collaboration:
- ❌ Before: No team sharing
- ✅ After: Team-wide visibility

### Analytics:
- ❌ Before: No insights
- ✅ After: Full analytics dashboard

### Performance:
- ❌ Before: Slow with 50+ calls
- ✅ After: Fast with pagination

---

## Supabase Setup Instructions

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in details:
   - **Name:** think-abc-sales
   - **Database Password:** [Generate strong password]
   - **Region:** Choose closest to your users
6. Wait 2-3 minutes for project creation

### Step 2: Get API Credentials

1. In Supabase Dashboard, go to Settings → API
2. Copy these values:
   - **Project URL:** https://xxx.supabase.co
   - **anon/public key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - **service_role key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (keep secret!)

### Step 3: Add to .env.local

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Create Database Schema

1. In Supabase Dashboard, go to SQL Editor
2. Click "New Query"
3. Paste the users table schema (from Session 1)
4. Click "Run"
5. Verify table created: Go to Table Editor → users

---

## Migration Strategy

### Phase 1: Dual Write (Week 2, Sessions 1-2)
- Write to both localStorage AND Supabase
- Read from Supabase, fallback to localStorage
- Ensures no data loss during migration

### Phase 2: Supabase Primary (Week 2, Session 3)
- Read/write only to Supabase
- Keep localStorage as backup for 1 week
- Monitor for issues

### Phase 3: Remove localStorage (Week 3, Session 1)
- Remove all localStorage code
- Full Supabase migration complete
- Clean up legacy code

---

## Testing Checklist (Week 2)

After each session, verify:

- [ ] **Session 1:**
  - [ ] Users can sign up (data saved to Supabase)
  - [ ] Users can login (data read from Supabase)
  - [ ] JWT token still works
  - [ ] Check Supabase Dashboard - see new user row

- [ ] **Session 2:**
  - [ ] Analyze call (saved to Supabase)
  - [ ] View call history (loaded from Supabase)
  - [ ] Pagination works
  - [ ] Check Supabase Dashboard - see call rows

- [ ] **Session 3:**
  - [ ] Add client (saved to Supabase)
  - [ ] View clients (loaded from Supabase)
  - [ ] Add campaign (saved to Supabase)
  - [ ] Check Supabase Dashboard - see data

- [ ] **Session 4:**
  - [ ] Admin dashboard loads
  - [ ] User count correct
  - [ ] Analytics queries work
  - [ ] Charts display data

---

## Rollback Plan

If anything goes wrong:

1. **Revert to previous commit:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Disable Supabase temporarily:**
   - Comment out Supabase code
   - Use localStorage fallback
   - Debug issue

3. **Data Recovery:**
   - localStorage data still available
   - Supabase has automatic backups
   - Can export data from Supabase Dashboard

---

## Cost Estimate (Supabase)

### Free Tier (Perfect for starting):
- ✅ 500 MB database storage
- ✅ 2 GB file storage
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests
- ✅ 500 MB egress (bandwidth)
- ✅ 2 CPU hours per day

### When to Upgrade:
- 1000+ users: ~$25/month (Pro plan)
- 10,000+ users: ~$599/month (Team plan)
- Enterprise: Custom pricing

**For your real estate use case (100s of calls/week):**
- Free tier is perfect for first 6-12 months
- Upgrade when you hit 500+ active users

---

**Ready to begin Week 2, Session 1?**

Let me know when you're ready and I'll start with Supabase setup!
