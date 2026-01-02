# Testing Guide - Week 1 Authentication System

## Quick Start Testing

### 1. Start the Development Server

```bash
cd /Users/charliebailey/Downloads/think-alm-sales\ \(3\)
npm run dev
```

The app should start at: `http://localhost:3003`

---

## Test Scenario 1: User Signup Flow

### Step 1: Open the App
1. Navigate to `http://localhost:3003`
2. You should see the landing page

### Step 2: Create a New Account
1. Click "Sign Up" or navigate to signup page
2. Fill in the form:
   - **Name:** Test User
   - **Email:** test@example.com
   - **Password:** password123
   - **Team Name:** Test Team
   - **Plan:** Individual (or any plan)

3. Click "Create Account"

### What Happens Behind the Scenes:
```
Frontend → POST /api/auth/signup
  ↓
Backend hashes password with bcrypt
  ↓
Backend creates user account
  ↓
Backend generates JWT token (7-day expiration)
  ↓
Frontend receives token + user object
  ↓
Token stored in localStorage
  ↓
User automatically logged in ✅
```

### Where to See the Signup Event:

**In Browser Console (F12 → Console tab):**
```
✅ Signup successful: test@example.com
```

**In Terminal (where npm run dev is running):**
```
✅ SIGNUP | test@example.com
[2026-01-02T04:00:00.000Z] POST /api/auth/signup | User: user-xxx | Status: 201
```

---

## Test Scenario 2: User Login Flow

### Step 1: Logout (if logged in)
1. Click your avatar or name in top-right
2. Click "Sign Out"
3. You should be redirected to login page

### Step 2: Login
1. Enter credentials:
   - **Email:** demo@thinkabc.com
   - **Password:** demo123
2. Click "Login"

### What Happens Behind the Scenes:
```
Frontend → POST /api/auth/login
  ↓
Backend finds account by email
  ↓
Backend verifies password with bcrypt
  ↓
Backend generates JWT token
  ↓
Frontend stores token in localStorage
  ↓
User logged in ✅
```

### Where to See the Login Event:

**In Browser Console:**
```
✅ Login successful: demo@thinkabc.com
```

**In Terminal:**
```
✅ LOGIN | demo@thinkabc.com
[2026-01-02T04:00:00.000Z] POST /api/auth/login | User: demo-1 | Status: 200
```

---

## Test Scenario 3: Analyze a Call (Protected Endpoint)

### Step 1: Navigate to Calls Page
1. Make sure you're logged in
2. Click "Calls" in the sidebar

### Step 2: Analyze a Call
1. Click "New Call" or paste a transcript:
```
Hello, this is John from Think Real Estate. I wanted to reach out about your property listing...
```
2. Click "Analyze Call"

### What Happens Behind the Scenes:
```
Frontend → authenticatedFetch('/api/analyze-call', {...})
  ↓
authenticatedFetch() adds: Authorization: Bearer <JWT_TOKEN>
  ↓
Backend → verifyAuth() checks token
  ↓
Backend extracts userId and userEmail from token
  ↓
Backend logs: 📞 Call analysis requested by user: demo-1 (demo@thinkabc.com)
  ↓
Backend analyzes call with Gemini/OpenAI
  ↓
Frontend receives analysis ✅
```

### Where to See the API Call:

**In Terminal:**
```
📞 Call analysis requested by user: demo-1 (demo@thinkabc.com)
Analyzing text with Gemini...
✅ Analysis completed
[2026-01-02T04:05:00.000Z] POST /api/analyze-call | User: demo-1 (demo@thinkabc.com) | Status: 200 | 1234ms
```

---

## Test Scenario 4: Send an Email (Protected Endpoint)

### Step 1: Send a Client Signup Email
1. Navigate to "Clients" page
2. Click "Add Client"
3. Fill in client details
4. Click "Send Signup Link"

### What Happens Behind the Scenes:
```
Frontend → authenticatedFetch('/api/send-email', {...})
  ↓
authenticatedFetch() adds: Authorization: Bearer <JWT_TOKEN>
  ↓
Backend verifies token
  ↓
Backend logs: 📧 Email send requested by user: demo-1 (demo@thinkabc.com)
  ↓
Email sent (or simulated if RESEND_API_KEY not configured)
```

### Where to See the Email Event:

**In Terminal:**
```
📧 Email send requested by user: demo-1 (demo@thinkabc.com)
📧 Email would be sent: {
  type: 'client-signup',
  to: 'client@example.com',
  data: { signupLink: '...', companyName: '...' }
}
```

---

## Test Scenario 5: Unauthorized Access (No Token)

### Step 1: Clear Your Token Manually
1. Open browser DevTools (F12)
2. Go to "Application" tab → "Local Storage"
3. Find `think-abc-auth-token`
4. Delete it
5. Keep `think-abc-auth-user` (so UI thinks you're logged in)

### Step 2: Try to Analyze a Call
1. Paste a transcript
2. Click "Analyze Call"

### What Should Happen:
```
Frontend → authenticatedFetch('/api/analyze-call', {...})
  ↓
No token in localStorage → No Authorization header
  ↓
Backend → verifyAuth() fails
  ↓
Backend returns: 401 Unauthorized - No token provided
  ↓
authenticatedFetch() sees 401 → Clears session
  ↓
User logged out automatically ✅
```

### Where to See the Error:

**In Browser Console:**
```
⚠️ Unauthorized request - clearing session
❌ Call analysis failed: Unauthorized - No token provided
```

**In Terminal:**
```
❌ Unauthorized request to /api/analyze-call
```

---

## Test Scenario 6: Invalid/Expired Token

### Step 1: Manually Set Invalid Token
1. Open browser DevTools (F12)
2. Go to "Application" tab → "Local Storage"
3. Find `think-abc-auth-token`
4. Change its value to: `invalid.token.here`

### Step 2: Try to Analyze a Call
1. Paste a transcript
2. Click "Analyze Call"

### What Should Happen:
```
Frontend → authenticatedFetch('/api/analyze-call', {...})
  ↓
Adds: Authorization: Bearer invalid.token.here
  ↓
Backend → jwt.verify() fails
  ↓
Backend returns: 401 Unauthorized - Invalid token
  ↓
authenticatedFetch() clears session
  ↓
User logged out ✅
```

---

## Where to Find User Activity

### Current State (Week 1):

**All activity is logged to the terminal/console:**

1. **Terminal (Backend Logs):**
   ```bash
   # Where you ran: npm run dev

   # You'll see:
   ✅ SIGNUP | user@example.com
   ✅ LOGIN | user@example.com
   📞 Call analysis requested by user: user-123 (user@example.com)
   📧 Email send requested by user: user-123 (user@example.com)
   [2026-01-02T04:00:00.000Z] POST /api/auth/signup | User: user-123 | Status: 201
   [2026-01-02T04:05:00.000Z] POST /api/analyze-call | User: user-123 | Status: 200 | 1234ms
   ```

2. **Browser Console (Frontend Logs):**
   ```javascript
   // Press F12 → Console tab

   // You'll see:
   ✅ Login successful: demo@thinkabc.com
   🚀 Analyzing call via backend API (bulletproof)...
   ✅ Analysis successful using: gemini
   ✅ Email sent successfully to: client@example.com
   ```

3. **localStorage (Session Data):**
   ```javascript
   // F12 → Application → Local Storage → http://localhost:3003

   // Current user:
   think-abc-auth-user: {"id":"demo-1","name":"Demo User","email":"demo@thinkabc.com",...}

   // JWT token:
   think-abc-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   // Legacy stored accounts:
   think-abc-user-accounts: [{"id":"demo-1","email":"demo@thinkabc.com",...}]
   ```

### What Changes in Week 2 (Supabase):

After we migrate to Supabase database, you'll have:

**1. Persistent User Database:**
```sql
-- Users table in Supabase
SELECT * FROM users ORDER BY created_at DESC;
-- Shows: All registered users with signup timestamps
```

**2. Activity Logs Table:**
```sql
-- Audit log table
SELECT * FROM audit_logs
WHERE user_id = 'demo-1'
ORDER BY timestamp DESC;
-- Shows: All API calls by user with timestamps
```

**3. Real-time Admin Dashboard:**
- Total users signed up
- Recent user activity
- API usage per user
- Call history per user
- Email sent history

**4. Notifications:**
- Email notifications when new users sign up
- Slack webhook integration (optional)
- Admin dashboard with real-time updates

---

## Monitoring User Signups (Current Setup)

### Method 1: Watch Terminal Logs
```bash
# In your terminal where npm run dev is running:
# Every signup will show:

✅ SIGNUP | newuser@example.com
[2026-01-02T04:10:00.000Z] POST /api/auth/signup | User: user-xxx (newuser@example.com) | Status: 201
```

### Method 2: Check localStorage
```javascript
// Open browser console and run:
JSON.parse(localStorage.getItem('think-abc-user-accounts'))

// Returns array of all accounts:
[
  {
    id: "demo-1",
    email: "demo@thinkabc.com",
    name: "Demo User",
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    createdAt: "2026-01-02T04:10:00.000Z"  // ← NEW USER!
  }
]
```

### Method 3: Vercel Logs (After Deployment)
When you deploy to Vercel, you can see logs in real-time:

1. Go to Vercel Dashboard
2. Click your project
3. Go to "Logs" tab
4. Filter by function: `api/auth/signup`
5. See all signup events with timestamps

---

## Testing Checklist

Run through this checklist to verify everything works:

- [ ] **Signup Flow**
  - [ ] Create new account
  - [ ] See success message
  - [ ] Automatically logged in
  - [ ] Token stored in localStorage
  - [ ] Terminal shows signup log

- [ ] **Login Flow**
  - [ ] Login with demo@thinkabc.com / demo123
  - [ ] See success message
  - [ ] Token stored in localStorage
  - [ ] Terminal shows login log

- [ ] **Protected API - Call Analysis**
  - [ ] Analyze a call transcript
  - [ ] See analysis results
  - [ ] Terminal shows: "📞 Call analysis requested by user: ..."
  - [ ] Backend logs show user ID and email

- [ ] **Protected API - Email**
  - [ ] Send a client signup email
  - [ ] Terminal shows: "📧 Email send requested by user: ..."
  - [ ] Email simulated (or sent if RESEND_API_KEY configured)

- [ ] **Logout Flow**
  - [ ] Click Sign Out
  - [ ] Token removed from localStorage
  - [ ] Redirected to login page
  - [ ] Cannot access protected pages

- [ ] **401 Error Handling**
  - [ ] Delete token from localStorage
  - [ ] Try to analyze a call
  - [ ] Get 401 error
  - [ ] Session cleared automatically
  - [ ] Redirected to login

- [ ] **Invalid Token Handling**
  - [ ] Set invalid token in localStorage
  - [ ] Try to analyze a call
  - [ ] Get "Invalid token" error
  - [ ] Session cleared automatically

---

## Common Issues & Solutions

### Issue 1: "No token provided" error
**Cause:** Not logged in or token was cleared
**Solution:** Login again

### Issue 2: "Invalid token" error
**Cause:** Token expired (7 days) or corrupted
**Solution:** Logout and login again

### Issue 3: CORS error in browser
**Cause:** Frontend origin not in ALLOWED_ORIGINS
**Solution:** Add `http://localhost:3003` to `.env.local`:
```bash
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:3003
```

### Issue 4: "Module not found: ../middleware/auth"
**Cause:** Backend files not deployed
**Solution:** Make sure all commits are pushed and Vercel redeployed

### Issue 5: Can't see terminal logs
**Cause:** Development server not running
**Solution:** Run `npm run dev` and keep terminal open

---

## Next Steps

### Week 2: Database Migration
Once you're satisfied with authentication testing, we'll migrate to Supabase:

**Benefits:**
- **Persistent user database** (no more localStorage)
- **Real-time admin dashboard** showing all users
- **Audit logs table** with searchable activity history
- **Email notifications** on new user signups
- **Analytics** - track user growth, API usage, etc.

**What We'll Build:**
1. Supabase user authentication (replaces localStorage)
2. Audit logs table (all API activity)
3. Admin dashboard (view all users and activity)
4. Email notifications (new signups, daily summaries)
5. Real-time analytics (user count, API usage)

---

## Quick Reference - Test Accounts

### Super Admin Account:
```
Email: admin@thinkabc.com
Password: ThinkABC2024!
Role: SUPER_ADMIN
```

### Demo Account:
```
Email: demo@thinkabc.com
Password: demo123
Role: ADMIN
```

### Create Your Own:
```
1. Click "Sign Up"
2. Fill in details
3. Account created with ADMIN role by default
```

---

**Happy Testing!** 🎉

If you see any errors or unexpected behavior, check:
1. Terminal logs (backend)
2. Browser console (frontend)
3. Network tab in DevTools (see actual API requests)
