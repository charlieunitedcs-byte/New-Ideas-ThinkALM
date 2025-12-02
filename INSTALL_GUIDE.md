# 🚀 Installation Guide

## ⚠️ Fix npm Permission Issue (One-Time Fix)

You need to fix npm cache permissions first. Run this in your terminal:

```bash
sudo chown -R 501:20 "/Users/charliebailey/.npm"
```

Enter your password when prompted. This fixes a one-time npm cache issue.

---

## ✅ Then Install & Run

After fixing permissions, run these commands:

### Step 1: Navigate to Project
```bash
cd "/Users/charliebailey/Downloads/think-alm-sales (3)"
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- `tailwindcss` - CSS framework
- `postcss` - CSS processing
- `autoprefixer` - Browser compatibility

### Step 3: Start Dev Server
```bash
npm run dev
```

### Step 4: Open in Browser
The terminal will show something like:
```
  VITE v6.2.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open: **http://localhost:5173**

---

## 🎯 What You'll See

Once the server starts and you open the browser, you'll see:

### Landing Page (Default View)
1. **Hero Section** with social proof stats
2. **Demo Video** placeholder with play button
3. **Customer Logos** (TechCorp, SalesForce Pro, etc.)
4. **Trust Badges** (SOC 2, GDPR, G2 Leader, 99.9% Uptime)
5. **Features Grid** (3 feature cards)
6. **Testimonials** (3 customer reviews with 5-star ratings)
7. **Pricing Section** with monthly/annual toggle
8. **Professional Footer** (4 columns)

### To See the App
Click **"Login"** button in the top right to enter the app dashboard.

---

## 🐛 Troubleshooting

### If you get "command not found: npm"
Install Node.js from https://nodejs.org

### If port 5173 is already in use
```bash
# Kill the process using the port
lsof -ti:5173 | xargs kill -9

# Or run on different port
npm run dev -- --port 3000
```

### If styles look broken
Make sure you ran `npm install` successfully. Check for errors in the terminal.

### To stop the server
Press `Ctrl + C` in the terminal

---

## 📸 What Changed Visually

### Before
- Basic landing page
- No social proof
- No testimonials
- Simple footer

### After
- **Social proof stats**: 2,400+ teams, 4.9/5 rating, 23% increase
- **Demo video section**: Professional play button with hover effects
- **Customer logos**: 4 placeholder companies
- **Trust badges**: 4 security/quality indicators
- **Testimonials**: 3 detailed customer reviews
- **Enhanced pricing**: Monthly/Annual toggle
- **Professional footer**: 4-column layout with 16+ links

### Browser Tab
You'll also see a new **favicon** (red→orange gradient icon) in the browser tab!

---

## ✅ Quick Command Summary

Run these in order:

```bash
# Fix permissions (one time)
sudo chown -R 501:20 "/Users/charliebailey/.npm"

# Navigate to project
cd "/Users/charliebailey/Downloads/think-alm-sales (3)"

# Install packages
npm install

# Start server
npm run dev

# Open browser to http://localhost:5173
```

---

## 🎨 Files to Review

Once running, you can also review the code:

1. **index.html** - New SEO meta tags
2. **pages/LandingPage.tsx** - New sections (lines 53-386)
3. **tailwind.config.js** - Tailwind setup
4. **index.css** - Custom styles
5. **public/favicon.svg** - Brand icon

---

**Need help?** Check the other documentation files:
- `VISUAL_CHANGES.md` - Visual walkthrough
- `UPGRADE_NOTES.md` - Technical details
- `NEXT_STEPS.md` - What to build next
- `CHANGES_SUMMARY.md` - Complete file breakdown
