# SYMTRI AI - Claude Code Context

> Copy this file to any Symtri AI project root as `CLAUDE.md` for automatic context loading.

**Last Updated:** December 26, 2025

---

## Company Overview

**Symtri AI** builds AI automation tools for small and mid-size businesses (SMBs).

- **Website:** https://symtri.ai
- **Tagline:** "Learn AI. Automate Growth."
- **Location:** Brownsville, Texas
- **Phone:** (956) 692-1385
- **Email:** hello@symtri.ai

**Target Market:** SMBs, professional services, trade services, healthcare practices

---

## Products

### SmartChat
- **URL:** https://smartchat.symtri.ai
- **Repo:** github.com/aguillen06/smartchat-pro
- **Description:** AI-powered website chatbot that answers questions, captures leads, and books appointments 24/7
- **Tech Stack:** Next.js 16, TypeScript, Supabase, Anthropic Claude API, Vercel
- **Status:** Live
- **Pricing:** $297/mo (Starter), $397/mo (Professional), $597/mo (Healthcare)

### PhoneBot
- **URL:** https://symtri.ai/phonebot
- **Dashboard:** https://phonebot.symtri.ai
- **Repo:** github.com/aguillen06/symtri-phonebot (dashboard), Symtri-Ai repo (landing page)
- **Description:** AI voice agent that answers calls, schedules appointments, and qualifies leads 24/7
- **Tech Stack:** Next.js, TypeScript, Supabase, Retell AI, Vercel
- **Status:** Live
- **Pricing:** $497/mo (Starter), $797/mo (Professional), $997/mo (Enterprise), +$200/mo HIPAA
- **Setup Fee:** $2,500 one-time

### LeadFlow (Planned)
- **URL:** https://symtri.ai/leadflow
- **Description:** Lead nurturing and follow-up automation
- **Status:** Planning

### ProcessPilot (Planned)
- **URL:** https://symtri.ai/processpilot
- **Description:** Business process automation
- **Status:** Planning

---

## Tech Stack

### Infrastructure
| Service | Purpose | Notes |
|---------|---------|-------|
| **Vercel** | Hosting | All web apps deployed here |
| **Supabase** | Database + Auth | PostgreSQL with Row-Level Security |
| **GitHub** | Code repos | Auto-deploy to Vercel on push |
| **Resend** | Email | Transactional emails |
| **Stripe** | Payments | Not yet integrated |

### AI Services
| Service | Purpose | Product |
|---------|---------|---------|
| **Anthropic Claude** | Chat AI | SmartChat |
| **Retell AI** | Voice AI | PhoneBot |
| **ElevenLabs** | Voice synthesis | PhoneBot (via Retell) |

### Development
- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth

---

## GitHub Repositories

| Repo | Purpose | Deploys To |
|------|---------|------------|
| `aguillen06/Symtri-Ai` | Main website (symtri.ai) | symtri.ai |
| `aguillen06/smartchat-pro` | SmartChat app | smartchat.symtri.ai |
| `aguillen06/symtri-phonebot` | PhoneBot dashboard | phonebot.symtri.ai |

---

## Design System

### Colors
```css
--black: #000000;
--white: #FFFFFF;
--grey-50: #FAFAFA;
--grey-100: #F4F4F5;
--grey-200: #E4E4E7;
--grey-600: #52525B;
--grey-700: #3F3F46;
--grey-900: #18181B;
--teal: #10B981;        /* Primary accent */
--teal-dark: #059669;
--teal-faint: rgba(16, 185, 129, 0.1);
```

### Typography
- **Headings:** Space Grotesk (700, 600)
- **Body:** Inter (400, 500, 600)

### UI Patterns
- Cards with 12px border-radius, 1px grey-200 border
- Hover states: teal border, translateY(-4px), shadow
- Buttons: 8px border-radius, teal primary
- Trust badges: pill-shaped (50px radius)

---

## Security Approach

**Philosophy:** "Enterprise Security. Built for SMBs."

### Key Points
- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Data Isolation:** Row-Level Security (RLS) in Supabase
- **Compliance:** SOC 2 aligned, HIPAA available (+$200/mo)
- **AI Training:** Conversations never used to train AI models
- **Data Control:** Export anytime, delete on request

### Security Pages
- PhoneBot: https://symtri.ai/phonebot/security
- SmartChat: https://smartchat.symtri.ai/security

---

## File Locations

### Main Website (symtri.ai)
```
~/Desktop/Symtri-Ai/
├── website/
│   ├── index.html           # Homepage
│   ├── phonebot/
│   │   ├── index.html       # PhoneBot landing page
│   │   └── security/        # Security detail page
│   ├── docs/smartchat/      # SmartChat docs
│   └── css/, js/            # Shared components
├── lovable/                  # React app (legacy)
└── vercel.json              # Routing config
```

### SmartChat
```
~/smartchat-pro/
├── app/
│   ├── api/                 # API routes (chat, auth, analytics)
│   ├── dashboard/           # Dashboard page
│   └── security/            # Security page
├── lib/                     # Utilities
└── public/
    └── index.html           # Landing page
```

### PhoneBot Dashboard
```
~/symtri-phonebot/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/             # API routes
│   │   ├── dashboard/       # Dashboard
│   │   └── signup/          # Onboarding flow
│   └── lib/
│       └── email.ts         # Welcome emails
├── docs/                    # Documentation
│   └── marketing/           # Sales materials
└── supabase/migrations/     # Database migrations
```

### Documentation
```
~/symtri-phonebot/docs/
├── CUSTOMER-ONBOARDING-CHECKLIST.md
└── marketing/
    ├── PHONEBOT-SALES-ONE-PAGER.md
    ├── PHONEBOT-TECHNICAL-ONE-PAGER.md
    ├── PHONEBOT-SECURITY-WHITEPAPER.md
    └── LANDING-PAGE-SECURITY-SECTION.md
```

---

## Recent Updates (December 2025)

### December 26, 2025
- Added security sections to PhoneBot and SmartChat landing pages
- Created security detail pages (/phonebot/security, /security)
- Updated messaging: "Enterprise Security. Built for SMBs." (SMB-focused, HIPAA secondary)
- Made hero grid animations lighter (50% opacity reduction)
- Fixed security page links

### December 25, 2025
- Enhanced PhoneBot signup flow with 4-step wizard
- Added welcome email system (English/Spanish)
- Created customer onboarding checklist
- Created marketing materials (one-pagers, whitepaper)

---

## Deployment

### Auto-Deploy (GitHub → Vercel)
All repos auto-deploy to Vercel when pushing to `main`:
- Push to `Symtri-Ai` → deploys to symtri.ai
- Push to `smartchat-pro` → deploys to smartchat.symtri.ai
- Push to `symtri-phonebot` → deploys to phonebot.symtri.ai

### Manual Deploy
```bash
cd [project-folder]
vercel --prod --yes
```

---

## Database (Supabase)

### PhoneBot Tables
- `phonebot.tenant_configs` - Customer settings
- `phonebot.users` - User accounts
- `phonebot.calls` - Call logs
- `phonebot.call_insights` - Analytics

### SmartChat Tables
- `knowledge_chunks` - RAG knowledge base
- `conversations` - Chat history
- `leads` - Captured leads

### Key Patterns
- Multi-tenant with `tenant_id` column
- Row-Level Security (RLS) on all tables
- UUIDs for primary keys

---

## Contacts

| Purpose | Email |
|---------|-------|
| General | hello@symtri.ai |
| Security | security@symtri.ai |
| Support | support@symtri.ai |

---

## Working With This Codebase

### Key Principles
1. **Bilingual Support:** All customer-facing features must support English and Spanish
2. **SMB Focus:** Keep messaging focused on SMBs, not enterprise
3. **Security First:** Healthcare-grade security for all customers
4. **Simple Pricing:** Transparent, no hidden fees

### Code Style
- TypeScript strict mode
- Tailwind CSS for styling
- Server components by default (Next.js)
- API routes in `app/api/`

### Before Deploying
1. Test locally
2. Check for TypeScript errors
3. Verify mobile responsiveness
4. Push to GitHub (auto-deploys)
