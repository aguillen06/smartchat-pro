# SmartChat Pro

An AI-powered customer service chatbot SaaS platform that enables businesses to deploy intelligent chat widgets on their websites.

## Overview

SmartChat Pro allows businesses to create customizable AI chatbots powered by Claude (Anthropic). Features include:

- Embeddable chat widgets with custom branding
- AI-powered responses using Claude 3.5 Sonnet
- Knowledge base integration for domain-specific answers
- Lead capture and conversation tracking
- Real-time analytics and insights
- Multi-tenant architecture with Supabase
- Stripe integration for subscription billing

## Tech Stack

- **Frontend & Backend**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **Validation**: Zod

## Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Supabase account and project
- Anthropic API key
- Stripe account (for payments)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd smartchat-pro
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in the following environment variables in your `.env` file:

**Supabase Configuration:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)

**Anthropic AI:**
- `ANTHROPIC_API_KEY` - Your Anthropic API key from console.anthropic.com

**NextAuth:**
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for development)

**Stripe:**
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook signing secret

**Application:**
- `NEXT_PUBLIC_APP_URL` - Your app's public URL

### 4. Set up the database

Run Supabase migrations to create the database schema:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Link your project
supabase link --project-ref <your-project-ref>

# Run migrations
supabase db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
smartchat-pro/
├── app/                    # Next.js App Router pages and API routes
├── components/            # React components
├── lib/                   # Utility functions and API clients
│   ├── supabase.ts       # Supabase client configuration
│   └── anthropic.ts      # Anthropic AI client and helpers
├── types/                 # TypeScript type definitions
│   └── index.ts          # Core data models
├── public/                # Static assets
├── supabase/
│   └── migrations/       # Database migration files
├── .env                   # Environment variables (not committed)
├── .env.example          # Example environment variables
└── package.json          # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Development Workflow

1. Create feature branches from `main`
2. Make your changes with proper TypeScript types
3. Test thoroughly in development
4. Create a pull request for review
5. Deploy to staging/production after approval

## Key Features to Implement

- [ ] User authentication and dashboard
- [ ] Widget creation and customization
- [ ] Chat widget embed script
- [ ] Real-time chat functionality
- [ ] Knowledge base management
- [ ] Lead capture forms
- [ ] Analytics dashboard
- [ ] Stripe subscription integration
- [ ] Webhook notifications
- [ ] API endpoints for programmatic access

## Database Schema

See `types/index.ts` for the complete data model including:
- Customers (businesses using the platform)
- Widgets (chat instances)
- Conversations (chat sessions)
- Messages (individual chat messages)
- Knowledge Docs (AI knowledge base)
- Leads (captured contact information)

## Contributing

1. Follow TypeScript best practices
2. Write clean, documented code
3. Use proper error handling
4. Test all changes before committing
5. Keep commits focused and descriptive

## License

Proprietary - All rights reserved

## Support

For questions or issues, please contact the development team.
