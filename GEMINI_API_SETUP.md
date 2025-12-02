# 🤖 Gemini API Setup - Make AI Roleplay Work!

## ✅ What We Just Fixed

1. ✅ Updated `geminiService.ts` to use correct environment variable
2. ✅ Updated `.env.local` and `.env.example` with `VITE_` prefix
3. ✅ Connected Roleplay page to Gemini API

## 🔑 Get Your Free Gemini API Key (2 minutes)

### Step 1: Go to Google AI Studio
**Open this link:** 👉 **https://makersuite.google.com/app/apikey**

### Step 2: Sign In
- Use your Google account
- Free tier includes generous usage limits

### Step 3: Create API Key
1. Click **"Create API Key"**
2. Select **"Create API key in new project"** (or use existing)
3. **Copy** the key that appears

### Step 4: Add to Your App
**Edit the file:** `.env.local`

Replace:
```env
VITE_GEMINI_API_KEY=PLACEHOLDER_API_KEY
```

With:
```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

Paste your real API key after the `=`

### Step 5: Restart Dev Server
Press `Ctrl + C` in Terminal to stop the server, then:
```bash
npm run dev
```

---

## 🎯 What Will Work Now

### ✅ AI Roleplay (Text Chat)
1. Go to http://localhost:3002
2. Login
3. Click **"AI Roleplay"** in sidebar
4. Start chatting with AI prospect
5. **Real AI responses!** 🎉

### ✅ Voice Mode (Advanced)
1. In Roleplay page
2. Click **microphone icon** to enable voice
3. Speak to the AI
4. AI speaks back in real-time
5. **Full voice conversation!** 🎤

### ✅ Call Analysis
1. Go to **"Call Intelligence"**
2. Upload transcript or audio
3. Get real AI-powered analysis
4. **Real scores and feedback!** 📊

---

## 🚀 Test It Now

### Quick Test:

1. **Stop the dev server** if running (Ctrl + C)
2. **Edit `.env.local`** - Add your real API key
3. **Restart:** `npm run dev`
4. **Login** to the app
5. **Click "AI Roleplay"**
6. **Type:** "Hi, tell me about Think ALM"
7. **See real AI response!** ✨

---

## 💰 Free Tier Limits

**Google Gemini Free Tier:**
- ✅ 15 requests per minute
- ✅ 1 million tokens per month
- ✅ Perfect for demos and development
- ✅ No credit card required

**This is MORE than enough for:**
- 100+ roleplay sessions/day
- 50+ call analyses/day
- Full development and testing

---

## 🛡️ Security Note

**Important:**
- ⚠️ Don't commit `.env.local` to GitHub (already in `.gitignore`)
- ⚠️ For production, move API calls to backend server
- ⚠️ Current setup is perfect for demo/development

---

## 🎨 What You'll Experience

### Before (Mock Data):
```
You: "Tell me about pricing"
AI: [No response - mock data only]
```

### After (Real AI):
```
You: "Tell me about pricing"
AI: "I'm interested, but concerned about cost.
     What's your pricing structure? How does it
     compare to tools like Gong or Chorus?"
```

**Real conversations with AI prospects!** 🎯

---

## ✅ Checklist

Before testing:
- [ ] Got API key from https://makersuite.google.com/app/apikey
- [ ] Updated `.env.local` with real key
- [ ] Restarted dev server (`npm run dev`)
- [ ] Opened http://localhost:3002
- [ ] Logged in (any credentials)
- [ ] Clicked "AI Roleplay"
- [ ] Sent first message

---

## 🐛 Troubleshooting

### "API Key is missing" error
- Check `.env.local` has `VITE_GEMINI_API_KEY=your_key`
- Make sure you restarted the dev server after adding key
- Variable name must start with `VITE_`

### "Authentication failed"
- API key might be invalid
- Get new key from https://makersuite.google.com/app/apikey
- Copy entire key (usually starts with `AIza...`)

### No AI response
- Check browser console (F12) for errors
- Verify API key is correct
- Check free tier limits (15 req/min)

---

## 🚀 Next Steps

Once AI Roleplay is working:

1. **Test Call Analysis** - Upload transcripts
2. **Try Voice Mode** - Enable microphone
3. **Deploy to Vercel** - Add API key as environment variable
4. **Show to users** - Get real feedback!

---

## 📚 Resources

- **Gemini API Docs:** https://ai.google.dev/docs
- **Free Tier Info:** https://ai.google.dev/pricing
- **API Keys:** https://makersuite.google.com/app/apikey

---

<div align="center">

## 🎉 You're Ready!

Get your API key, add it to `.env.local`, restart the server,
and experience **real AI conversations!**

</div>
