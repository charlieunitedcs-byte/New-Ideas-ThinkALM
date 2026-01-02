# Think ABC → Real Estate Platform: 1-Week Rebrand Plan

## Executive Summary

Transform Think ABC from SaaS sales coaching to **real estate brokerage management platform** in 1 week.

**Focus:** AI coaching for property calls (listings, showings, negotiations)
**Target User:** Brokerage managers tracking agent performance
**Timeline:** 5 days
**Effort:** ~12 files to modify, no architecture changes

---

## What's Changing

### Core Concept Shift

| From (SaaS Sales) | To (Real Estate) |
|-------------------|------------------|
| Sales reps selling software | Real estate agents selling properties |
| CIO prospects evaluating tools | Buyers/sellers/investors |
| "We use spreadsheets" objection | "I'm working with another agent" |
| Discovery questions about ROI | Property needs, budget, timeline |
| Product demo, pricing discussion | Property walkthrough, offer negotiation |
| Implementation timeline | Transaction timeline (escrow, inspection) |

---

## Day 1: AI Coaching Prompts (Critical)

### File 1: `/services/geminiService.ts`

**Current (Lines 55-91):** Enterprise SaaS sales coaching
**New:** Real estate call coaching

Replace entire analysis prompt:

```typescript
const ANALYSIS_PROMPT = `You are a STRICT expert real estate coach with 20+ years of experience training top-performing agents and brokers.

Analyze this sales call/property discussion and provide detailed coaching feedback.

SCORING RUBRIC (0-100 scale):
- Property knowledge & research: Did the agent research the property, neighborhood, comps? (-20 if lacking)
- Listening to client needs: Did they identify buyer/seller priorities (budget, timeline, must-haves)? (-15 if poor)
- Rapport building: Did they establish trust and connection with the client? (-10 if weak)
- Handling objections: How did they respond to concerns about price, location, condition? (-10 if inadequate)
- Next steps clarity: Clear follow-up plan (showings, offers, inspections)? (-10 if vague)
- Talk-to-listen ratio: Agent should listen 50%+ of the time (-10 if dominating)
- Market knowledge: Did they demonstrate expertise in local market trends? (-10 if missing)
- Urgency creation: Did they create appropriate urgency without being pushy? (-5 if missing)

Emotional Intelligence (0-100): Did they read client emotions (excitement, hesitation, concerns) and adapt their approach?

Return JSON:
{
  "score": 85,
  "summary": "Strong property walkthrough with good rapport, but missed opportunity to discuss comparable sales",
  "strengths": ["Excellent property knowledge", "Built strong rapport", "Asked about buyer timeline"],
  "improvements": ["Discuss recent comparable sales", "Address financing earlier", "Set clearer next steps"],
  "tone": "Professional and consultative",
  "emotionalIntelligence": 78
}`;
```

**Lines 147-182:** Audio analysis prompt - same changes as above

**Lines 258-268:** Roleplay system instruction

Replace buyer persona:

```typescript
const DEFAULT_SYSTEM_INSTRUCTION = `You are ONLY a potential buyer/seller/investor, NOT a real estate agent. You are being contacted by a real estate agent.

IMPORTANT RULES:
- You are a buyer looking for a property (or seller with a property to list)
- Ask realistic buyer questions: price, location, square footage, schools, HOA fees, property taxes
- Express common concerns: "Is this a good neighborhood?", "The price seems high", "How long has it been on the market?", "I'm working with another agent"
- React naturally to the agent's pitch - be skeptical but open
- If they don't ask about your needs, volunteer: "I'm looking for 3+ bedrooms near good schools"
- Challenge them on value: "Why should I pay asking price?", "What about [nearby cheaper listing]?"
- DO NOT give sales advice or act as the agent
- DO NOT immediately agree to everything
- Maintain character as the prospect throughout`;
```

### File 2: `/services/agentSettingsService.ts`

**Lines 17-36:** Default persona and system prompt

```typescript
export const DEFAULT_AGENT_SETTINGS: AgentSettings = {
  personaName: 'First-Time Homebuyer - Suburban',
  systemPrompt: `You are ONLY a potential buyer/seller/investor, NOT a real estate agent.

SCENARIO: You are a first-time homebuyer looking for a starter home in the suburbs.

YOUR PROFILE:
- Budget: $400-500K
- Looking for: 3 bed, 2 bath, good school district
- Timeline: Ready to buy within 3 months
- Concerns: Nervous about bidding wars, want to avoid fixer-uppers

YOUR QUESTIONS TO ASK:
- "How's the school district?"
- "What are property taxes like?"
- "Is this a good neighborhood for families?"
- "How long has it been on the market?"
- "Are there any HOA fees?"

YOUR OBJECTIONS:
- "I'm working with another agent already"
- "The price seems a bit high for this area"
- "I need to think about it"
- "Can we negotiate on price?"

React naturally - be skeptical but open. If the agent builds trust and answers your questions well, become more interested.`,

  voiceProvider: 'vapi',
  voiceId: 'jennifer',
  stability: 0.50,
  similarityBoost: 0.75,
  firstMessageEnabled: true,
  recordSessions: true
};
```

---

## Day 2: Training Content & UI Copy

### File 3: `/pages/TrainingLibrary.tsx`

**Lines 12-19:** Mock training materials

Replace with real estate content:

```typescript
const mockMaterials: TrainingMaterial[] = [
  {
    id: '1',
    title: 'Listing Presentation Mastery',
    type: 'PDF',
    category: 'Listing Skills',
    url: 'mock-url-1',
    addedBy: 'Platform Admin',
    date: '2024-03-15',
    visibility: 'GLOBAL'
  },
  {
    id: '2',
    title: 'Handling "Price is Too High" Objections',
    type: 'VIDEO',
    category: 'Objection Handling',
    url: 'mock-url-2',
    addedBy: 'Platform Admin',
    date: '2024-03-10',
    visibility: 'GLOBAL'
  },
  {
    id: '3',
    title: 'Buyer Consultation Script',
    type: 'PDF',
    category: 'Buyer Representation',
    url: 'mock-url-3',
    addedBy: 'Platform Admin',
    date: '2024-03-01',
    visibility: 'GLOBAL'
  },
  {
    id: '4',
    title: 'Market Analysis Presentation',
    type: 'PDF',
    category: 'Market Knowledge',
    url: 'mock-url-4',
    addedBy: 'Charlie Bailey',
    date: '2024-02-28',
    visibility: 'TEAM',
    teamId: 'team-1'
  },
  {
    id: '5',
    title: 'Closing Techniques for Luxury Properties',
    type: 'VIDEO',
    category: 'Negotiation',
    url: 'mock-url-5',
    addedBy: 'Platform Admin',
    date: '2024-02-20',
    visibility: 'GLOBAL'
  },
  {
    id: '6',
    title: 'Investment Property Pitch Framework',
    type: 'PDF',
    category: 'Commercial/Investment',
    url: 'mock-url-6',
    addedBy: 'Platform Admin',
    date: '2024-02-15',
    visibility: 'GLOBAL'
  }
];
```

**Lines 284, 499, 607-611:** Category filter options

```typescript
const categories = [
  'All Categories',
  'Listing Skills',
  'Buyer Representation',
  'Objection Handling',
  'Negotiation',
  'Market Knowledge',
  'Commercial/Investment',
  'Legal/Compliance'
];
```

### File 4: `/pages/LandingPage.tsx`

**Lines 77-82:** Hero section

```typescript
<h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
  <span className="text-white">AI-Powered Coaching</span>
  <br />
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-500">
    for Top Real Estate Teams
  </span>
</h1>
<p className="text-xl md:text-2xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
  Train your agents with AI-powered call analysis, roleplay simulations, and performance tracking built for brokerage managers.
</p>
```

**Lines 86-102:** Social proof stats

```typescript
<div className="grid grid-cols-3 gap-8 mb-16">
  <div className="text-center">
    <p className="text-4xl font-black text-white mb-2">1,200+</p>
    <p className="text-slate-400 text-sm">Real Estate Offices</p>
  </div>
  <div className="text-center">
    <p className="text-4xl font-black text-white mb-2">4.9/5</p>
    <p className="text-slate-400 text-sm">Agent Satisfaction</p>
  </div>
  <div className="text-center">
    <p className="text-4xl font-black text-white mb-2">31%</p>
    <p className="text-slate-400 text-sm">Avg. Close Rate Increase</p>
  </div>
</div>
```

**Lines 134:** Demo video description

```typescript
<p className="text-slate-300 leading-relaxed">
  See how brokerages use our platform to train agents, analyze property calls, and track team performance in real-time.
</p>
```

**Lines 198-202:** Feature descriptions

Update each feature card:

1. **Call Intelligence** → "Analyze listing calls, buyer consultations, and negotiation conversations with AI-powered feedback on property knowledge, rapport building, and objection handling."

2. **AI Roleplay** → "Practice property walkthroughs, buyer consultations, and pricing discussions with AI prospects who ask realistic questions and raise common objections."

3. **Campaign Command** → "Track performance across marketing campaigns—spring listings, luxury segment, investment properties, and seasonal initiatives."

---

## Day 3: Terminology & Labels

### File 5: `/pages/Dashboard.tsx`

**Line 40:** Page title
```typescript
<h1 className="text-3xl font-bold text-white mb-2">Brokerage Command Center</h1>
```

**Lines 52-54:** Quick actions
```typescript
"Analyze Property Call"
"Practice Buyer Consultation"
"Review Team Performance"
```

### File 6: `/pages/CallAnalysis.tsx`

**Line 29:** Page title
```typescript
<h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
  <PhoneCall className="text-brand-500" size={32} /> Property Call Intelligence
</h1>
<p className="text-slate-400">Upload listing calls, buyer consultations, or negotiation conversations for AI-powered coaching feedback.</p>
```

**Line 72:** Upload section
```typescript
<p className="text-slate-400 text-sm mb-6">
  Upload a property call recording (MP3, WAV, M4A) or paste a transcript of your agent's conversation.
</p>
```

### File 7: `/pages/Roleplay.tsx`

**Lines 100, 167:** Scenario descriptions

```typescript
"Practice buyer consultations, property walkthroughs, and price negotiations with AI prospects"
```

**Line 88:** System prompt label
```typescript
<label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
  Buyer/Seller Persona
</label>
```

### File 8: `/pages/TeamPerformance.tsx`

**Line 43:** Page title
```typescript
<h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
  <BarChart2 className="text-brand-500" size={32} /> Agent Team Pulse
</h1>
<p className="text-slate-400">Monitor your agents' call quality, training completion, and performance metrics.</p>
```

**Lines 185-187:** Metric labels
```typescript
"Calls Analyzed" → "Property Calls Analyzed"
"Avg. Call Score" → "Avg. Call Quality"
"Training Sessions" → "Training Completed"
```

### File 9: `/pages/Campaigns.tsx`

**Line 81:** Page title
```typescript
<h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
  <Megaphone className="text-brand-500" size={32} /> Marketing Campaign Tracking
</h1>
<p className="text-slate-400">Track agent performance across listing campaigns, seasonal initiatives, and market segments.</p>
```

**Line 252:** Form placeholder
```typescript
placeholder="e.g. Spring Luxury Listings 2024"
```

---

## Day 4: Sidebar & Navigation

### File 10: `/App.tsx`

**Lines 90-112:** Sidebar menu items

Update labels and section headers:

```typescript
<div className="px-4 mb-3 text-[10px] font-bold text-brand-400/80 uppercase tracking-widest">
  Agent Tools
</div>
<SidebarItem to="/" icon={LayoutDashboard} label="Command Center" />
<SidebarItem to="/calls" icon={PhoneCall} label="Call Intelligence" />
<SidebarItem to="/roleplay" icon={Sparkles} label="AI Roleplay" />
<SidebarItem to="/training" icon={Library} label="Training Library" />

<div className="px-4 mt-8 mb-3 text-[10px] font-bold text-brand-400/80 uppercase tracking-widest">
  Brokerage Management
</div>
<SidebarItem to="/campaigns" icon={Megaphone} label="Marketing Campaigns" />
<SidebarItem to="/team" icon={BarChart2} label="Agent Performance" />
<SidebarItem to="/ai-agents" icon={Cpu} label="Persona Builder" />
```

---

## Day 5: AI Prompt Refinements & Testing

### File 11: `/services/openaiService.ts`

**Lines 13, 29:** Platform title

```typescript
'X-Title': 'Real Estate Coaching Platform'
// ...
"You are an expert real estate coach and trainer."
```

### File 12: `/pages/AIAgentConfig.tsx`

**Lines 45-55:** Persona presets

Add real estate buyer/seller personas:

```typescript
const PERSONA_PRESETS = [
  {
    name: 'First-Time Homebuyer - Budget Conscious',
    prompt: `You are a first-time homebuyer with a $350K budget, nervous about the process...`
  },
  {
    name: 'Luxury Buyer - High Expectations',
    prompt: `You are a high-net-worth buyer looking for a luxury property $2M+...`
  },
  {
    name: 'Investment Property Buyer',
    prompt: `You are an investor evaluating rental properties, focused on cash flow and ROI...`
  },
  {
    name: 'Seller - Needs Quick Sale',
    prompt: `You are a homeowner who needs to sell quickly due to job relocation...`
  },
  {
    name: 'Commercial Tenant - Office Space',
    prompt: `You are a business owner looking for commercial office space...`
  }
];
```

---

## Testing Checklist (Day 5 afternoon)

### AI Coaching Quality

Test with real estate call scenarios:
- [ ] Upload sample listing call → Check if analysis mentions property knowledge, rapport building
- [ ] Test "price too high" objection → Verify coaching suggests comp analysis
- [ ] Verify scoring rubric focuses on real estate metrics (not SaaS metrics)
- [ ] Check emotional intelligence detection for buyer excitement/hesitation

### Roleplay Accuracy

- [ ] Start voice roleplay → Confirm AI acts as buyer (not sales coach)
- [ ] Test common questions: "What's the school district?", "How long on market?"
- [ ] Verify objections: "Working with another agent", "Price seems high"
- [ ] Confirm AI doesn't give coaching advice during roleplay

### UI/Content Consistency

- [ ] Check all page titles mention real estate (not "sales")
- [ ] Verify training categories are real estate focused
- [ ] Confirm campaign examples use property scenarios
- [ ] Test that all "SaaS" or "software" references are removed

### Data & Functionality

- [ ] Create test campaign: "Spring Luxury Listings" → Verify it saves
- [ ] Upload training material: "Buyer Consultation Script" → Check category filter
- [ ] Test team performance with agent names → Confirm metrics display
- [ ] Verify all features still work (no broken functionality)

---

## Deployment Sequence

**Day 5 - End of Day:**

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "Rebrand platform for real estate industry

   - Update AI coaching prompts for property calls
   - Replace training content with real estate materials
   - Change UI copy and terminology
   - Add buyer/seller personas for roleplay
   - Update landing page for brokerage managers"

   git push
   ```

2. **Vercel auto-deploys** (1-2 minutes)

3. **Post-deployment check:**
   - Visit live site
   - Test call analysis with sample real estate transcript
   - Start roleplay session to verify buyer persona
   - Create test campaign

---

## File Change Summary

| File | Changes | Lines Modified |
|------|---------|----------------|
| `services/geminiService.ts` | AI coaching prompts | 55-91, 147-182, 258-268 |
| `services/agentSettingsService.ts` | Default persona | 17-36 |
| `pages/TrainingLibrary.tsx` | Mock materials, categories | 12-19, 284, 499, 607-611 |
| `pages/LandingPage.tsx` | Hero, stats, features | 77-202 |
| `pages/Dashboard.tsx` | Title, quick actions | 40, 52-54 |
| `pages/CallAnalysis.tsx` | Title, description | 29, 72 |
| `pages/Roleplay.tsx` | Scenario text | 100, 167 |
| `pages/TeamPerformance.tsx` | Title, metrics | 43, 185-187 |
| `pages/Campaigns.tsx` | Title, placeholder | 81, 252 |
| `App.tsx` | Sidebar labels | 90-112 |
| `services/openaiService.ts` | Platform title | 13, 29 |
| `pages/AIAgentConfig.tsx` | Persona presets | 45-55 |

**Total:** 12 files, ~200 lines of changes

---

## Success Metrics

After 1 week, the platform should:
- ✅ All AI coaching feedback references real estate scenarios (property knowledge, market analysis)
- ✅ Roleplay AI acts as buyers/sellers with realistic objections
- ✅ Training library has real estate categories and sample materials
- ✅ UI uses "agent", "brokerage", "property" terminology (no "SaaS", "software")
- ✅ Landing page targets brokerage managers
- ✅ All existing features work without breaking
- ✅ Demo mode shows real estate examples

---

## What's NOT Changing (Out of Scope for 1-Week Rebrand)

- ❌ Database schema (keep existing structure)
- ❌ Property-specific fields (address, MLS ID, listing price)
- ❌ MLS/CRM integrations
- ❌ Commission calculations
- ❌ Transaction pipeline tracking
- ❌ Showing schedules
- ❌ Architecture or code structure

These can be added later as feature enhancements if needed.

---

## Next Steps After Rebrand

**Phase 2 (Optional - Future Enhancement):**

If you want to add real estate-specific features later:

1. **Property Tracking** (1 week)
   - Add property fields to call_analyses table (address, MLS_ID, listing_price)
   - Link calls to specific properties
   - Property pipeline view

2. **Real Estate Metrics** (1 week)
   - Days on market tracking
   - List price vs sale price
   - Showing-to-offer conversion
   - Commission tracking

3. **MLS Integration** (2-3 weeks)
   - Connect with MLS APIs
   - Auto-import property data
   - Sync listing status

But for now, the 1-week rebrand gives you a fully functional real estate coaching platform!

---

## HOW TO USE THIS PLAN

**When you're ready to implement, just say:**

> "Implement Day 1 of the real estate rebrand plan"

Or:

> "Do the entire real estate rebrand from REAL_ESTATE_REBRAND_PLAN.md"

I'll follow this plan step-by-step and make all the changes!
