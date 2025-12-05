# Supabase Setup for Audio Storage

## Why Supabase?

With Supabase, you can:
- ✅ Upload audio files of **any size** (no more 3MB limit!)
- ✅ Handle 100MB+ audio files easily
- ✅ Store and replay call recordings
- ✅ FREE tier includes 1GB storage
- ✅ Fast CDN delivery
- ✅ No changes to the user interface

**Without Supabase:** Audio files are limited to 3MB and sent as base64 (fallback mode)

---

## Setup Instructions (5 Minutes)

### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign in with GitHub (or email)
4. Create a new organization (free)

### Step 2: Create a New Project

1. Click **"New Project"**
2. Name: `think-abc` (or your preferred name)
3. Database Password: Choose a strong password (save it!)
4. Region: Select closest to your users
5. Plan: **Free** (perfect for MVP)
6. Click **"Create new project"**
7. Wait 2-3 minutes for setup

### Step 3: Create Storage Bucket

1. In Supabase Dashboard, go to **Storage** (left sidebar)
2. Click **"Create a new bucket"**
3. Bucket name: `call-recordings`
4. Public bucket: **YES** (check the box)
   - This allows the backend to download audio via signed URLs
5. Click **"Create bucket"**

### Step 4: Get Your API Keys

1. Go to **Settings** → **API** (left sidebar)
2. You'll see:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (looks like: `eyJhbGciOi...`)
3. Copy both values

### Step 5: Add to Your .env.local

Create/edit `.env.local` in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Use the exact variable names above!

### Step 6: Add to Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Environment Variables**
3. Add these two variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` (your anon key) |

4. Add to **all environments** (Production, Preview, Development)
5. Click **Save**

### Step 7: Redeploy

```bash
git push origin main
```

Vercel will auto-deploy with the new environment variables.

---

## Testing

### Test Locally (Optional)

1. Make sure `.env.local` has Supabase credentials
2. Run: `npm run dev`
3. Go to Call Analysis page
4. Upload an audio file (try a 5MB+ file!)
5. Should work perfectly!

### Test in Production

1. Wait 2 minutes after deployment
2. Go to your production site
3. Try uploading a large audio file (>3MB)
4. Should now work! (Before it would fail)

### Check Console

Open browser console (F12) during upload. You should see:
```
📤 Uploading audio to Supabase Storage...
✅ Audio uploaded to Supabase: temp/1234567890-abc123.mp3
✅ Got signed URL from Supabase
🎤 Analyzing audio via backend API...
📥 Downloading audio from URL: https://...
✅ Audio downloaded successfully
✅ Analysis successful using: gemini
```

---

## Fallback Behavior

**If Supabase is NOT configured:**
- App still works!
- Falls back to base64 upload
- 3MB file size limit applies
- Shows warning in console

**If Supabase IS configured:**
- Can upload 50MB+ files
- No payload size errors
- Faster uploads (direct to CDN)

---

## Storage Limits

### Free Tier (Perfect for MVP)
- **Storage:** 1GB
- **Transfer:** 2GB/month
- **File uploads:** 50MB max per file (configurable)

### Typical Usage
- Average sales call (5 min, MP3 128kbps): ~5MB
- **1GB can store:** ~200 call recordings
- Temporary files are auto-deleted after analysis

### Paid Tier (If Needed)
- **Pro Plan:** $25/month
- **Storage:** 8GB
- **Transfer:** 50GB/month
- Can store 1,600+ recordings

---

## Bucket Configuration (Advanced)

If you want stricter security:

### Option 1: Public Bucket (Easiest)
- Anyone with signed URL can access
- URLs expire after 1 hour
- ✅ Recommended for MVP

### Option 2: Private Bucket with RLS (More Secure)
1. Create bucket as **private**
2. Set up Row Level Security policies
3. Require authentication to access

For now, **public bucket with signed URLs** is perfect!

---

## Troubleshooting

### "Failed to upload to Supabase"

**Check:**
1. Bucket name is exactly `call-recordings`
2. Bucket is set to **public**
3. Environment variables are correct
4. Variables added to **all environments** in Vercel

### "Audio downloaded but analysis failed"

- This means Supabase upload worked!
- Check Gemini API key is configured
- Check console for Gemini error message

### "Still seeing 3MB limit error"

- Supabase isn't configured
- Check `.env.local` and Vercel environment variables
- Redeploy after adding variables

---

## Benefits You Get

✅ **No more payload size errors**
- Upload 100MB+ audio files

✅ **Better user experience**
- Faster uploads (direct to CDN)
- Can add upload progress bars

✅ **Enable new features**
- Save recordings for later review
- Download original audio files
- Playback directly in app

✅ **Production-ready**
- Scalable storage
- Fast global CDN
- 99.9% uptime

---

## Cost Summary

**MVP/Small Business:**
- Supabase Free: $0/month
- Handles ~200 recordings
- Perfect for getting started

**Growing Business:**
- Supabase Pro: $25/month
- Handles 1,600+ recordings
- Professional features

**Enterprise:**
- Custom pricing
- Unlimited storage
- Dedicated support

---

## Success Checklist

After setup, you should have:

- ✅ Supabase project created
- ✅ `call-recordings` bucket created (public)
- ✅ API keys added to `.env.local`
- ✅ API keys added to Vercel
- ✅ Redeployed to production
- ✅ Can upload 50MB audio files
- ✅ No more "payload too large" errors

You're all set! 🎉
