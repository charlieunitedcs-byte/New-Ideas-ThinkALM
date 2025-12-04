# Email Setup Guide for Think ABC

This guide will help you set up automated email sending for client signup links and reports.

## Overview

The application uses [Resend](https://resend.com) for sending emails through a serverless function deployed on Vercel.

## Features

✅ **Automated Client Signup Emails** - When you add a client, they automatically receive a signup link
✅ **Admin Notifications** - You (charlie@thinkalm.ai) get notified when new signups occur
✅ **Report Emails** - Send call analysis and team performance reports via email
✅ **Professional Email Templates** - Branded, responsive HTML emails

---

## Setup Instructions

### Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (3,000 emails/month free)
3. Verify your email address

### Step 2: Get Your API Key

1. Log into Resend dashboard
2. Go to **API Keys** section
3. Click **Create API Key**
4. Name it "Think ABC Production"
5. Copy the API key (starts with `re_...`)

### Step 3: Configure Your Domain (Optional but Recommended)

**Option A: Use Resend's Free Domain (Quick Start)**
- Emails will be sent from `onboarding@resend.dev`
- No setup required, works immediately

**Option B: Use Your Own Domain (Professional)**
1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `thinkalm.ai`)
4. Add the DNS records shown to your domain provider
5. Wait for verification (usually 1-24 hours)

### Step 4: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Example |
|--------------|-------|---------|
| `RESEND_API_KEY` | Your Resend API key | `re_123abc...` |
| `SENDER_EMAIL` | Email address to send from | `Think ABC <noreply@thinkalm.ai>` |
| `ADMIN_EMAIL` | Your admin email for notifications | `charlie@thinkalm.ai` |

**Important:** Make sure to add these to **all environments** (Production, Preview, Development)

### Step 5: Install Dependencies and Deploy

Run these commands locally:

```bash
# Install the new dependency
npm install

# Test the build
npm run build

# Commit and push to trigger Vercel deployment
git add .
git commit -m "Add email functionality"
git push
```

---

## Testing

### Test Client Signup Email

1. Log into your app as admin
2. Go to **Clients** page
3. Click **Add Client**
4. Fill in test details (use your own email for testing)
5. Submit
6. Check your email inbox

### What You Should See

**Client receives:**
- Beautiful branded email with Think ABC logo
- "Complete Your Registration" button
- Link expires in 7 days notice
- Professional styling

**You (admin) receive:**
- Notification that a new client signed up
- Company name, contact name, and email
- Timestamp of signup

---

## Using Email in Your Code

### Send Client Signup Email (Already Implemented)

```typescript
import { sendSignupEmail } from '../services/clientSignupService';

await sendSignupEmail(
  'client@example.com',
  'Acme Corp',
  'https://app.com/#/client-signup/token123',
  'John Smith'
);
```

### Send Call Analysis Report

```typescript
import { sendCallReport } from '../services/emailService';

await sendCallReport('user@example.com', {
  callId: '123',
  score: 85,
  summary: 'Great call with excellent closing technique',
  strengths: ['Active listening', 'Clear communication'],
  improvements: ['Handle objections better'],
  date: new Date().toLocaleString()
});
```

### Send Team Performance Report

```typescript
import { sendTeamReport } from '../services/emailService';

await sendTeamReport('manager@example.com', {
  teamName: 'Sales Team Alpha',
  period: 'November 2024',
  totalCalls: 150,
  averageScore: 82,
  topPerformers: [
    { name: 'John Doe', score: 95 },
    { name: 'Jane Smith', score: 92 }
  ],
  summary: 'Team exceeded targets this month'
});
```

### Send Custom Notification

```typescript
import { sendNotification } from '../services/emailService';

await sendNotification(
  'user@example.com',
  'Your Weekly Summary',
  '<h1>Great week!</h1><p>You completed 25 calls...</p>'
);
```

---

## Troubleshooting

### Emails Not Sending

1. **Check Environment Variables**
   - Go to Vercel → Settings → Environment Variables
   - Verify `RESEND_API_KEY` is set correctly
   - Redeploy after adding variables

2. **Check Browser Console**
   - Look for error messages
   - Should see "✅ Email sent successfully to: ..." or error details

3. **Check Resend Dashboard**
   - Go to Resend → Emails
   - See delivery status of recent emails
   - Check for any errors or bounces

4. **Verify Domain**
   - If using custom domain, ensure DNS records are verified
   - Try using `onboarding@resend.dev` temporarily

### Emails Going to Spam

1. **Use Custom Domain** - Much better deliverability than resend.dev
2. **Authenticate Your Domain** - Add SPF, DKIM records (Resend handles this)
3. **Warm Up Your Domain** - Start with small volumes, gradually increase

### Rate Limits

- Free tier: 3,000 emails/month, 100 emails/day
- If you need more, upgrade to Resend Pro

---

## Email Templates

All email templates are in `/api/send-email.ts`. You can customize:

- Colors and branding
- Logo and header
- Button styles
- Footer content

---

## Cost

| Plan | Emails/Month | Cost |
|------|--------------|------|
| Free | 3,000 | $0 |
| Pro | 50,000 | $20/month |
| Business | 100,000+ | Custom |

For most use cases, the free tier is sufficient.

---

## Security Notes

- ✅ API keys stored in Vercel environment variables (encrypted)
- ✅ Never commit API keys to git
- ✅ Serverless function validates all inputs
- ✅ Rate limiting handled by Resend
- ✅ Email addresses validated before sending

---

## Support

- **Resend Docs:** https://resend.com/docs
- **Resend Support:** support@resend.com
- **This Project:** Check `/api/send-email.ts` and `/services/emailService.ts`

---

## Next Steps

After setup is complete:

1. ✅ Test sending a client signup email
2. ✅ Verify you receive admin notifications
3. 🔄 Implement report email buttons in the UI
4. 🔄 Add scheduled weekly report emails
5. 🔄 Create email preferences for users

Enjoy your automated email system! 📧
