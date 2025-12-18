// scripts/ingest-symtri-knowledge.ts
// Loads all Symtri AI knowledge into SmartChat RAG system

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { knowledgeService } from "../lib/rag/knowledge-service";

// ============================================================================
// STEP 1: REPLACE WITH YOUR TENANT ID
// ============================================================================

const SYMTRI_TENANT_ID = "c48decc4-98f5-4fe8-971f-5461d3e6ae1a";

// ============================================================================
// STEP 2: ALL SYMTRI AI KNOWLEDGE CONTENT
// ============================================================================

const symtriKnowledge = [
  // COMPANY OVERVIEW - ENGLISH
  {
    content: `Symtri AI is an AI automation company based in Brownsville, Texas, serving small and medium businesses across the United States. Our mission: "Learn AI. Automate Growth." We solve the critical problem where 77% of SMBs want AI adoption but 85% of AI projects fail. Founded by Andres Guillen with 10+ years of B2B SaaS experience and UT Austin AI/LLM certification.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "about",
      product: "shared",
      language: "en",
      sectionTitle: "Company Overview",
      tags: ["about", "mission", "founder"],
    },
  },

  // COMPANY OVERVIEW - SPANISH
  {
    content: `Symtri AI es una empresa de automatización con IA basada en Brownsville, Texas. Servimos a pequeñas y medianas empresas en Estados Unidos. Nuestra misión: "Aprende IA. Automatiza Crecimiento." Fundada por Andres Guillen con 10+ años de experiencia en ventas B2B SaaS.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "about",
      product: "shared",
      language: "es",
      sectionTitle: "Resumen de la Empresa",
      tags: ["about", "mission", "founder"],
    },
  },

  // CONTACT INFORMATION
  {
    content: `Contact Symtri AI: Website: https://symtri.ai, Phone: (956) 692-1385 (24/7 AI assistant Hailey), Email: hello@symtri.ai, Location: Brownsville, Texas. Schedule consultation: https://calendly.com/symtri-ai/30min`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "contact",
      product: "shared",
      language: "en",
      tags: ["contact", "phone", "email", "calendly"],
    },
  },

  // SMARTCHAT FEATURES
  {
    content: `SmartChat is a 24/7 AI-powered website chatbot that captures and qualifies leads. Key features: bilingual support (English/Spanish/Spanglish), lead qualification, CRM integration (HubSpot, Salesforce, Pipedrive), appointment booking via Calendly, custom training on your business, smart routing (hot leads get SMS, warm leads get email), analytics dashboard, mobile optimized, healthcare-grade security. Live in 7-10 business days.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "service",
      product: "smartchat",
      language: "en",
      sectionTitle: "SmartChat Features",
      tags: ["smartchat", "features", "chatbot"],
    },
  },

  // SMARTCHAT PRICING
  {
    content: `SmartChat pricing: Setup fee $1,500 one-time (includes custom training and integration). Basic Plan: $297/month (1,000 conversations). Pro Plan: $397/month (3,000 conversations + priority support). Healthcare Add-on: +$200/month (HIPAA compliance). Special offer: First 5 customers get 50% off setup fee ($750) and locked pricing for 12 months.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "pricing",
      product: "smartchat",
      language: "en",
      sectionTitle: "SmartChat Pricing",
      tags: ["smartchat", "pricing", "cost"],
    },
  },

  // PHONEBOT FEATURES
  {
    content: `PhoneBot is an AI voice assistant that answers every call within 2 rings, 24/7. Features: bilingual conversations (English/Spanish/Spanglish), appointment scheduling (Google Calendar), lead qualification and capture, smart routing (urgent calls transfer, others schedule callback), call transcripts, after-hours coverage, emergency detection, CRM integration, real-time dashboard, healthcare-ready. Live in 24 hours.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "service",
      product: "phonebot",
      language: "en",
      sectionTitle: "PhoneBot Features",
      tags: ["phonebot", "features", "voice", "ai phone"],
    },
  },

  // PHONEBOT PRICING
  {
    content: `PhoneBot pricing: Setup fee $1,500 one-time (includes phone number, AI training, calendar integration). Starter: $297/month (0-500 calls). Professional: $397/month (501-1,500 calls + CRM integration + priority support). Healthcare: $597/month (HIPAA compliant + unlimited calls). Special offer: First 5 customers get 50% off setup ($750) and locked pricing for 12 months.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "pricing",
      product: "phonebot",
      language: "en",
      sectionTitle: "PhoneBot Pricing",
      tags: ["phonebot", "pricing", "cost"],
    },
  },

  // PHONEBOT DEMO CTA
  {
    content: `Try PhoneBot right now! Call (956) 692-1385 and talk to Hailey, our AI assistant. Experience how PhoneBot handles real conversations in English or Spanish. No appointment needed - call 24/7 to test it yourself.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "cta",
      product: "phonebot",
      language: "en",
      sectionTitle: "PhoneBot Demo",
      tags: ["phonebot", "demo", "trial", "call"],
    },
  },

  // FAQ - DIFFERENTIATORS
  {
    content: `How is Symtri AI different from other AI companies? (1) Bilingual by default - all products work in English, Spanish, and Spanglish, (2) SMB-focused pricing - affordable for small businesses, not just enterprise, (3) Productized solutions - pre-built and ready to deploy, not expensive custom builds, (4) Healthcare-grade security built in from day one, (5) Fast deployment - 24 hours to 30 days, not 6-month implementations, (6) We use our own products - PhoneBot answers our calls, SmartChat is on our site.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "shared",
      language: "en",
      sectionTitle: "Why Symtri AI Different",
      tags: ["faq", "differentiators", "competitive advantage"],
    },
  },

  // FAQ - TARGET INDUSTRIES
  {
    content: `What industries does Symtri AI serve? We specialize in: Healthcare (medical, dental, mental health practices), Professional services (law firms, accounting, insurance agencies), Home services (HVAC, plumbing, roofing, pool services), B2B services (agencies, consultants, SaaS companies). Our bilingual capability makes us especially strong in markets serving Hispanic communities, particularly the Rio Grande Valley.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "shared",
      language: "en",
      sectionTitle: "Target Industries",
      tags: ["faq", "industries", "target market"],
    },
  },

  // FAQ - CONTRACTS
  {
    content: `Do you require long-term contracts? No. All plans are month-to-month. Cancel anytime. You own all your data and can export it before canceling. We believe in earning your business every month, not locking you into long contracts.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "shared",
      language: "en",
      sectionTitle: "Contracts and Cancellation",
      tags: ["faq", "contracts", "cancellation", "terms"],
    },
  },

  // FAQ - SPANISH SUPPORT (ENGLISH)
  {
    content: `Can you handle Spanish-speaking customers? Yes! This is our specialty. All products are bilingual from day one: SmartChat responds fluently in Spanish, PhoneBot speaks Spanish naturally and handles Spanglish code-switching, all documentation and support available in Spanish. We understand Hispanic markets - we're based in the Rio Grande Valley. This is rare in AI automation - most companies treat Spanish as an expensive add-on or afterthought.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "shared",
      language: "en",
      sectionTitle: "Spanish Language Support",
      tags: ["faq", "spanish", "bilingual", "language"],
    },
  },

  // FAQ - SPANISH SUPPORT (SPANISH)
  {
    content: `¿Puede manejar clientes que hablan español? ¡Sí! Esta es nuestra especialidad. Todos los productos son bilingües desde el primer día: SmartChat responde fluidamente en español, PhoneBot habla español naturalmente y maneja cambio de código (Spanglish), toda la documentación y soporte disponible en español. Entendemos los mercados hispanos - estamos basados en el Valle del Río Grande.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "shared",
      language: "es",
      sectionTitle: "Soporte en Español",
      tags: ["faq", "spanish", "bilingual", "language"],
    },
  },

  // FAQ - INTEGRATIONS
  {
    content: `What tools does Symtri AI integrate with? CRMs: HubSpot, Salesforce, Pipedrive. Calendars: Google Calendar, Outlook, Calendly. Communication: Slack, Microsoft Teams. Automation: Zapier (5,000+ apps), Make.com, n8n. Custom: API access for custom integrations (Pro/Enterprise plans). We handle all integration setup during onboarding.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "shared",
      language: "en",
      sectionTitle: "Integrations",
      tags: ["faq", "integrations", "crm", "calendar"],
    },
  },

  // FAQ - SUPPORT
  {
    content: `What kind of support does Symtri AI provide? Email support with 24-hour response (4 hours for Pro/Enterprise). Phone support at (956) 692-1385 during business hours. White-glove onboarding for all new customers. 2-hour training session included with setup. Quarterly check-ins to improve performance. We're here to make sure you succeed.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "shared",
      language: "en",
      sectionTitle: "Support",
      tags: ["faq", "support", "help", "training"],
    },
  },

  // FAQ - SECURITY
  {
    content: `How does Symtri AI handle data security? All products built with healthcare-grade security: Data encrypted in transit (TLS 1.3) and at rest (AES-256), SOC 2 Type II principles embedded, HIPAA compliance available for healthcare clients (+$200/mo), regular security audits and penetration testing, Business Associate Agreements available, no data sharing with third parties ever. Security is built in, not bolted on later.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "shared",
      language: "en",
      sectionTitle: "Security and Compliance",
      tags: ["faq", "security", "hipaa", "compliance", "data"],
    },
  },

  // FAQ - TIMELINE
  {
    content: `How long does implementation take? SmartChat: 7-10 business days. PhoneBot: 24 hours (often same business day). LeadFlow: 2-3 weeks (launching Q1 2026). ProcessPilot: 3-4 weeks (launching Q1 2026). ContentCraft: 1-2 weeks (launching Q2 2026). We handle everything - you just provide your business info and we do the technical setup.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "shared",
      language: "en",
      sectionTitle: "Implementation Timeline",
      tags: ["faq", "timeline", "deployment", "setup"],
    },
  },

  // FAQ - ROI EXAMPLES
  {
    content: `Real ROI examples for Symtri AI products: Medical Practice - Missing 50% of after-hours calls = $25K/month lost revenue. PhoneBot cost $797/month = 3,100% ROI. Law Firm - 30% of website visitors leave without engaging = 15 lost leads/month. SmartChat cost $297/month captured 12 additional leads = 400% ROI. Home Services - Receptionist salary $35K/year ($2,917/month). PhoneBot cost $797/month = $2,120/month savings (73% cost reduction).`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "shared",
      language: "en",
      sectionTitle: "ROI Examples",
      tags: ["faq", "roi", "savings", "value"],
    },
  },

  // CTA - GET STARTED
  {
    content: `Ready to get started with Symtri AI? Next steps: (1) Book a free 30-minute consultation at https://calendly.com/symtri-ai/30min, (2) Email hello@symtri.ai with your questions, (3) Call (956) 692-1385 to talk to Hailey our AI assistant who will connect you with Andres, (4) Try PhoneBot right now by calling (956) 692-1385 24/7. No pressure, no hard sell - we're here to help you understand if AI automation makes sense for your business.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "cta",
      product: "shared",
      language: "en",
      sectionTitle: "Get Started",
      tags: ["cta", "next steps", "contact"],
    },
  },
];

// ============================================================================
// STEP 3: RUN INGESTION
// ============================================================================

async function ingestSymtriKnowledge() {
  console.log("🚀 Starting Symtri AI knowledge base ingestion...");
  console.log(`📦 Total chunks to ingest: ${symtriKnowledge.length}`);

  // Tenant ID is configured
  console.log(`📍 Using tenant ID: ${SYMTRI_TENANT_ID}`);

  try {
    console.log("\n⏳ Ingesting knowledge chunks...");
    const ids = await knowledgeService.ingestBatch(symtriKnowledge);
    console.log(`✅ Ingested ${ids.length} knowledge chunks`);

    // Approve all chunks
    console.log("\n⏳ Approving all chunks...");
    for (const id of ids) {
      await knowledgeService.approve(id, SYMTRI_TENANT_ID);
    }
    console.log("✅ All chunks approved");

    console.log("\n🎉 Knowledge base setup complete!");
    console.log("SmartChat is now ready to answer questions about Symtri AI");
    console.log("\n📝 Test it with questions like:");
    console.log('  - "What does Symtri AI do?"');
    console.log('  - "How much does SmartChat cost?"');
    console.log('  - "¿Puedes hablar español?"');
    console.log('  - "How do I get started?"');
  } catch (error) {
    console.error("\n❌ Ingestion failed:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  ingestSymtriKnowledge()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { ingestSymtriKnowledge };
