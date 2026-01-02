# Testing Protected API Endpoints

## Overview

After Week 1, Session 2, these endpoints now require JWT authentication:
- `/api/analyze-call` - Call analysis (was vulnerable to $500+ abuse)
- `/api/send-email` - Email sending (was vulnerable to spam)

**CRITICAL:** Without authentication, these endpoints return **401 Unauthorized**.

---

## Setup

Make sure:
1. Dev server is running: `npm run dev`
2. `.env.local` has `JWT_SECRET` and `ALLOWED_ORIGINS` configured
3. You have a valid JWT token (from login endpoint)

---

## Test 1: Analyze Call WITHOUT Token (Should Fail)

```bash
curl -X POST http://localhost:3003/api/analyze-call \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Hello, this is a test call"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Unauthorized - No token provided"
}
```

**Status Code:** 401

**✅ Success criteria:** Request is rejected without authentication

---

## Test 2: Get JWT Token First

```bash
TOKEN=$(curl -s -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@thinkabc.com","password":"demo123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Your token: $TOKEN"
```

Save this token - you'll use it in the next tests.

---

## Test 3: Analyze Call WITH Token (Should Succeed)

```bash
curl -X POST http://localhost:3003/api/analyze-call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "transcript": "Hello prospect, this is John from Think ABC. I wanted to reach out because I noticed your company is still using manual processes for sales coaching..."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "result": {
    "score": 85,
    "summary": "Strong opening with personalization...",
    "strengths": [...],
    "improvements": [...],
    "tone": "Professional",
    "emotionalIntelligence": 78,
    "transcript": "..."
  },
  "provider": "gemini"
}
```

**Status Code:** 200

**Console Output Should Show:**
```
📞 Call analysis requested by user: demo-1 (demo@thinkabc.com)
Analyzing text with Gemini...
✅ Analysis completed
```

**✅ Success criteria:**
- Request succeeds with valid token
- User info logged in console
- Analysis returned

---

## Test 4: Analyze Call with EXPIRED Token (Should Fail)

```bash
# Use an old/fake token
curl -X POST http://localhost:3003/api/analyze-call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid" \
  -d '{
    "transcript": "Test call"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid token"
}
```

**Status Code:** 401

**✅ Success criteria:** Invalid tokens are rejected

---

## Test 5: Send Email WITHOUT Token (Should Fail)

```bash
curl -X POST http://localhost:3003/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "notification",
    "to": "test@example.com",
    "data": {
      "subject": "Test Email",
      "message": "This is a test"
    }
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Unauthorized - No token provided"
}
```

**Status Code:** 401

**✅ Success criteria:** Email endpoint protected

---

## Test 6: Send Email WITH Token (Should Succeed)

```bash
curl -X POST http://localhost:3003/api/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "notification",
    "to": "test@example.com",
    "data": {
      "subject": "Test Notification",
      "message": "<p>This is a test notification from the API</p>"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email simulated (RESEND_API_KEY not configured)"
}
```
*(Or actual messageId if RESEND_API_KEY is configured)*

**Console Output Should Show:**
```
📧 Email send requested by user: demo-1 (demo@thinkabc.com)
📧 Email would be sent: { type: 'notification', to: 'test@example.com', ... }
```

**✅ Success criteria:**
- Request succeeds with valid token
- User info logged
- Email would be sent (or simulated)

---

## Test 7: CORS Protection - Wrong Origin

```bash
curl -X POST http://localhost:3003/api/analyze-call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: https://evil-site.com" \
  -d '{
    "transcript": "Test"
  }'
```

**Expected Behavior:**
- Request may succeed (backend doesn't block)
- **But** browser would block the response due to CORS
- `Access-Control-Allow-Origin` header should NOT include `evil-site.com`

**✅ Success criteria:** CORS headers only allow whitelisted origins

---

## Test 8: Check Audit Logs

After running the above tests, check your console/terminal where dev server is running.

**You should see logs like:**
```
📞 Call analysis requested by user: demo-1 (demo@thinkabc.com)
Analyzing text with Gemini...
[2026-01-02T03:30:00.000Z] POST /api/analyze-call | User: demo-1 (demo@thinkabc.com) | Status: 200 | 1234ms

📧 Email send requested by user: demo-1 (demo@thinkabc.com)
📧 Email would be sent: { type: 'notification', to: 'test@example.com', ... }
```

**✅ Success criteria:** Every API request is logged with user context

---

## Full Test Script (All-in-One)

Save this as `test-protected-endpoints.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3003"

echo "🧪 Testing Protected API Endpoints"
echo "=================================="
echo ""

# Test 1: Get token
echo "1️⃣ Getting JWT token..."
TOKEN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@thinkabc.com","password":"demo123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  exit 1
fi

echo "✅ Token received: ${TOKEN:0:20}..."
echo ""

# Test 2: Analyze call without token (should fail)
echo "2️⃣ Testing analyze-call WITHOUT token (should fail)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/analyze-call \
  -H "Content-Type: application/json" \
  -d '{"transcript":"Test"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "401" ]; then
  echo "✅ Correctly rejected (401)"
else
  echo "❌ Should have rejected with 401, got $HTTP_CODE"
fi
echo ""

# Test 3: Analyze call WITH token (should succeed)
echo "3️⃣ Testing analyze-call WITH token (should succeed)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/analyze-call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"transcript":"Hello, this is a sales call test"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ Successfully analyzed (200)"
else
  echo "❌ Should have succeeded with 200, got $HTTP_CODE"
fi
echo ""

# Test 4: Send email without token (should fail)
echo "4️⃣ Testing send-email WITHOUT token (should fail)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"type":"notification","to":"test@example.com","data":{"subject":"Test","message":"Test"}}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "401" ]; then
  echo "✅ Correctly rejected (401)"
else
  echo "❌ Should have rejected with 401, got $HTTP_CODE"
fi
echo ""

# Test 5: Send email WITH token (should succeed)
echo "5️⃣ Testing send-email WITH token (should succeed)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type":"notification","to":"test@example.com","data":{"subject":"Test","message":"Test"}}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ Successfully sent email (200)"
else
  echo "❌ Should have succeeded with 200, got $HTTP_CODE"
fi
echo ""

echo "=================================="
echo "✅ All tests completed!"
echo ""
echo "Check your server logs for audit trail entries like:"
echo "  📞 Call analysis requested by user: demo-1 (demo@thinkabc.com)"
echo "  📧 Email send requested by user: demo-1 (demo@thinkabc.com)"
```

Run it:
```bash
chmod +x test-protected-endpoints.sh
./test-protected-endpoints.sh
```

---

## What We've Secured

### Before Session 2:
❌ Anyone could call `/api/analyze-call` → $500+ abuse risk
❌ Anyone could call `/api/send-email` → Spam/phishing risk
❌ CORS wildcard `*` allowed any origin
❌ No audit trail of who used the APIs

### After Session 2:
✅ JWT authentication required for all API endpoints
✅ CORS restricted to whitelisted origins only
✅ Every request logged with user ID and email
✅ Invalid tokens rejected with 401
✅ Expired tokens rejected with proper error
✅ Authorization header required

---

## Attack Scenarios Now Prevented

### Scenario 1: API Cost Explosion
**Before:** Attacker scripts 50,000 calls → $2,000 bill
**After:** Attacker gets 401 Unauthorized → $0 cost ✅

### Scenario 2: Email Spam
**Before:** Attacker sends 10,000 spam emails via your endpoint
**After:** Attacker gets 401 Unauthorized → 0 emails sent ✅

### Scenario 3: CSRF from Evil Site
**Before:** `evil-site.com` could make requests via user's browser
**After:** CORS blocks response, origin not whitelisted ✅

### Scenario 4: Anonymous Usage
**Before:** No way to know who used the API
**After:** Every request logged with user context ✅

---

## Troubleshooting

**Issue: "Module not found: ../middleware/auth"**
- Solution: Make sure `middleware/auth.ts` exists from Session 1

**Issue: "Token is undefined"**
- Solution: Check that login endpoint returned a token
- Verify `.env.local` has `JWT_SECRET`

**Issue: "CORS error in browser"**
- Solution: Add your frontend URL to `ALLOWED_ORIGINS` in `.env.local`
- Example: `ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3003`

**Issue: "Still returning mock analysis"**
- This is OK! It means Gemini API key isn't configured
- The important thing is authentication works
- Set `GEMINI_API_KEY` in Vercel environment variables for real analysis

---

## Next Session Preview

**Week 1, Session 3** will integrate the frontend to:
- Call login endpoint and store JWT token
- Include JWT in all API requests (analyze-call, send-email)
- Handle 401 errors and redirect to login
- Implement Sign Out functionality

After Session 3, the entire authentication flow will be complete end-to-end!

---

## Checklist

After running tests, verify:

- [ ] `/api/analyze-call` requires JWT token
- [ ] `/api/send-email` requires JWT token
- [ ] Invalid tokens return 401
- [ ] Missing tokens return 401
- [ ] Valid tokens succeed (200)
- [ ] CORS headers use environment variable
- [ ] Console shows user ID in logs
- [ ] All tests in test script pass

---

**Security Status:** 🟢 API endpoints are now protected!

**Cost Risk:** ✅ Eliminated - No one can abuse APIs without authentication
**Spam Risk:** ✅ Eliminated - Email endpoint requires valid JWT
**CORS Risk:** ✅ Mitigated - Only whitelisted origins allowed
**Audit Trail:** ✅ Implemented - Every request logged with user context
