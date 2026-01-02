# Testing Authentication Endpoints

## Setup

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. The endpoints will be available at:
   - Login: `http://localhost:3000/api/auth/login`
   - Signup: `http://localhost:3000/api/auth/signup`

---

## Test 1: Login with Demo User

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@thinkabc.com",
    "password": "demo123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "demo-1",
    "name": "Demo User",
    "email": "demo@thinkabc.com",
    "role": "ADMIN",
    "team": "Demo Team",
    "plan": "COMPANY",
    "status": "Active"
  }
}
```

**✅ Success criteria:** You get a token and user object

---

## Test 2: Login with Super Admin

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@thinkabc.com",
    "password": "ThinkABC2024!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "super-admin-1",
    "name": "Super Admin",
    "email": "admin@thinkabc.com",
    "role": "SUPER_ADMIN",
    "team": "Admin",
    "plan": "ENTERPRISE",
    "status": "Active"
  }
}
```

**✅ Success criteria:** You get a token with SUPER_ADMIN role

---

## Test 3: Login with Invalid Password

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@thinkabc.com",
    "password": "wrongpassword"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

**✅ Success criteria:** You get 401 error

---

## Test 4: Signup New User

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User",
    "team": "Test Team",
    "plan": "INDIVIDUAL",
    "existingAccounts": []
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-1234567890-abc123",
    "name": "Test User",
    "email": "test@example.com",
    "role": "ADMIN",
    "team": "Test Team",
    "plan": "INDIVIDUAL",
    "status": "Active"
  },
  "accountData": {
    "id": "user-1234567890-abc123",
    "name": "Test User",
    "email": "test@example.com",
    "passwordHash": "$2a$10$...",
    "role": "ADMIN",
    "team": "Test Team",
    "plan": "INDIVIDUAL",
    "status": "Active",
    "createdAt": "2026-01-02T..."
  }
}
```

**✅ Success criteria:**
- You get a token
- passwordHash starts with `$2a$10$` (bcrypt hash)
- Password is NOT stored in plaintext

---

## Test 5: Signup with Duplicate Email

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@thinkabc.com",
    "password": "SecurePass123!",
    "name": "Test User",
    "existingAccounts": [
      {"email": "demo@thinkabc.com"}
    ]
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Email already registered"
}
```

**✅ Success criteria:** You get 409 conflict error

---

## Test 6: Signup with Weak Password

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "123",
    "name": "Test User",
    "existingAccounts": []
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Password must be at least 8 characters long"
}
```

**✅ Success criteria:** You get 400 validation error

---

## Test 7: Verify JWT Token

First, login to get a token:
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@thinkabc.com","password":"demo123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"
```

Then verify the token by calling a protected endpoint (we'll create this in Week 1, Session 2):
```bash
curl -X GET http://localhost:3000/api/protected-test \
  -H "Authorization: Bearer $TOKEN"
```

---

## Using Postman (Alternative to curl)

### Import this collection:

1. **Login Request**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "demo@thinkabc.com",
       "password": "demo123"
     }
     ```

2. **Signup Request**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/signup`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "newuser@example.com",
       "password": "SecurePass123!",
       "name": "New User",
       "team": "My Team",
       "existingAccounts": []
     }
     ```

3. Save the token from the response
4. Use it in Authorization header: `Bearer <your-token>`

---

## Quick Verification Checklist

Run these tests and check off:

- [ ] Demo user login works
- [ ] Super admin login works
- [ ] Invalid password returns 401
- [ ] Signup creates new user with hashed password
- [ ] Duplicate email returns 409
- [ ] Weak password returns 400
- [ ] Token is a valid JWT format

---

## What We've Accomplished

✅ **Backend authentication endpoints created**
- POST /api/auth/login - Returns JWT token
- POST /api/auth/signup - Creates user with bcrypt hashed password

✅ **Security improvements**
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 7-day expiration
- Email validation
- Password strength validation

✅ **Middleware ready**
- `middleware/auth.ts` - JWT verification
- `generateToken()` - Token creation
- `verifyAuth()` - Request authentication
- `verifyRole()` - Role-based access control

---

## Next Session Preview

**Week 1, Session 2** will add authentication to the existing API endpoints:
- Protect `/api/analyze-call`
- Protect `/api/send-email`
- Fix CORS wildcard
- Add request logging

After that session, **NO ONE** will be able to abuse your API endpoints without a valid JWT token!

---

## Troubleshooting

**Issue: "Module not found: jsonwebtoken"**
- Solution: Make sure you ran `npm install` in the terminal

**Issue: "JWT_SECRET not defined"**
- Solution: Check that `.env.local` has `JWT_SECRET=...` (no VITE_ prefix)

**Issue: "CORS error in browser"**
- Solution: Make sure `ALLOWED_ORIGINS` includes your frontend URL

**Issue: "Cannot connect to localhost:3000"**
- Solution: Make sure dev server is running: `npm run dev`
