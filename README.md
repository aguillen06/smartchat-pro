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

You have three options to run the database migrations:

**Option 1: Using Supabase CLI (Recommended)**

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Link your project (find project-ref in your Supabase dashboard URL)
supabase link --project-ref <your-project-ref>

# Run migrations
supabase db push
```

**Option 2: Using Supabase Dashboard (Easiest)**

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Open `supabase/migrations/20241123000000_initial_schema.sql` from your project
5. Copy and paste the entire contents into the SQL Editor
6. Click **Run** to execute the migration

**Option 3: Using psql**

```bash
# Get your connection string from Supabase Dashboard → Project Settings → Database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres" \
  -f supabase/migrations/20241123000000_initial_schema.sql
```

**Optional: Load seed data for testing**

After running migrations, you can optionally load sample data:

```bash
# Using Supabase Dashboard SQL Editor:
# Copy and paste contents of supabase/seeds/dev_seed.sql

# Or using psql:
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres" \
  -f supabase/seeds/dev_seed.sql
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
│   ├── supabase.ts       # Supabase client configuration & helpers
│   └── anthropic.ts      # Anthropic AI client and helpers
├── types/                 # TypeScript type definitions
│   └── index.ts          # Core data models
├── scripts/               # Utility scripts
│   └── run-migrations.ts # Database migration runner
├── public/                # Static assets
├── supabase/
│   ├── migrations/       # Database migration files
│   └── seeds/            # Seed data for development
├── .env                   # Environment variables (not committed)
├── .env.example          # Example environment variables
└── package.json          # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run migrate` - View migration files and instructions
- `npm run migrate:seed` - View migration and seed files

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

The database schema is defined in `supabase/migrations/20241123000000_initial_schema.sql` and includes:

**Core Tables:**
- `customers` - Business customers using the platform (with subscription tiers)
- `widgets` - Chatbot instances that can be embedded on websites
- `knowledge_docs` - Documents providing context for AI responses
- `conversations` - Chat sessions between visitors and the AI
- `messages` - Individual messages within conversations
- `leads` - Contact information captured from conversations

**Key Features:**
- Foreign key constraints with cascading deletes
- Indexes on frequently queried columns for performance
- `updated_at` triggers for customers and widgets
- Check constraints for data validation (role, plan_type, etc.)
- UUID primary keys for all tables

**Helper Functions:**
The `lib/supabase.ts` file includes ready-to-use helper functions:
- `getCustomerByEmail()` - Fetch customer by email
- `getWidgetByKey()` - Get widget configuration by widget key
- `createConversation()` - Start a new conversation
- `getConversationWithMessages()` - Fetch full conversation history
- `addMessage()` - Add a message to a conversation
- `getKnowledgeDocs()` - Get knowledge base for a widget
- `createLead()` - Capture lead information

See `types/index.ts` for complete TypeScript type definitions.

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
