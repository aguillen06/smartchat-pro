// scripts/ingest-symtri-knowledge.ts
// Loads all Symtri AI knowledge into SmartChat RAG system
// Updated: January 2026 - New 3-Product Model (Academy, Lead Response, Secure Workspace)

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
  // ============================================================================
  // COMPANY OVERVIEW
  // ============================================================================

  // COMPANY OVERVIEW - ENGLISH
  {
    content: `Symtri AI helps small and mid-sized businesses learn, automate, and protect with AI. Based in Brownsville, Texas. Our mission: "Learn. Automate. Protect." We offer three products: (1) Academy - AI education for business leaders, (2) Lead Response - 24/7 AI lead capture via phone and chat, (3) Secure Workspace - private enterprise AI deployment. Founded by Andres Guillen with 10+ years B2B experience and UT Austin AI certification.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "about",
      product: "shared",
      language: "en",
      sectionTitle: "Company Overview",
      tags: ["about", "mission", "founder", "products"],
    },
  },

  // COMPANY OVERVIEW - SPANISH
  {
    content: `Symtri AI ayuda a pequeñas y medianas empresas a aprender, automatizar y protegerse con IA. Ubicados en Brownsville, Texas. Nuestra misión: "Aprende. Automatiza. Protege." Ofrecemos tres productos: (1) Academia - educación de IA para líderes empresariales, (2) Captura de Leads - captura de clientes 24/7 con IA por teléfono y chat, (3) Espacio Seguro - despliegue de IA empresarial privado. Fundado por Andres Guillen con 10+ años de experiencia B2B.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "about",
      product: "shared",
      language: "es",
      sectionTitle: "Resumen de la Empresa",
      tags: ["about", "mission", "founder", "products"],
    },
  },

  // CONTACT INFORMATION
  {
    content: `Contact Symtri AI: Website: https://symtri.ai, Phone: (956) 692-1385 (AI assistant available 24/7). Contact by product: Academy - education@symtri.ai, Lead Response - sales@symtri.ai, Secure Workspace - partners@symtri.ai, General - hello@symtri.ai. Schedule consultation: https://calendly.com/andres-symtri/30min`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "contact",
      product: "shared",
      language: "en",
      tags: ["contact", "phone", "email", "calendly"],
    },
  },

  // ============================================================================
  // PRODUCT 1: ACADEMY
  // ============================================================================

  // ACADEMY OVERVIEW
  {
    content: `Symtri Academy is an AI education course for business leaders. Learn to use AI tools effectively without becoming a developer. The course covers: AI fundamentals (what AI really is), daily productivity tools (ChatGPT, Claude, Gemini), implementing AI in your business, industry-specific applications, and creating your 30-day AI action plan. Self-paced online learning with professional certification included.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "service",
      product: "academy",
      language: "en",
      sectionTitle: "Academy Overview",
      tags: ["academy", "education", "training", "course"],
    },
  },

  // ACADEMY MODULES
  {
    content: `Symtri Academy course modules: Module 1 - AI Fundamentals for Business Leaders (45 min): What AI really is, the 85% failure rate and how to avoid it, quick wins. Module 2 - AI Tools for Daily Productivity (45 min): Text generation, research, image creation, no-code automation. Module 3 - Implementing AI in Your Business (45 min): Identifying automation opportunities, evaluating vendors, building AI policy, measuring ROI. Module 4 - Industry-Specific Applications (30 min): Professional services, healthcare (HIPAA), manufacturing, retail case studies. Module 5 - Your AI Action Plan (30 min): 30-day implementation checklist, resources, certification. Bonus: 50+ prompt templates and tool comparison guide.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "service",
      product: "academy",
      language: "en",
      sectionTitle: "Academy Modules",
      tags: ["academy", "modules", "curriculum", "course"],
    },
  },

  // ACADEMY PRICING
  {
    content: `Symtri Academy pricing: Free tier - Module 1 (AI Fundamentals) + PDF resources + email updates. Full Course - $197 one-time - All 5 modules, worksheets, 50+ prompt templates, AI-Ready Professional Certificate. Course + Consultation - $397 one-time - Everything in Full Course plus 30-minute strategy call with AI Readiness Assessment and priority support. Launch special: Join waitlist for 50% off. First 10 students get founder pricing at just $47.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "pricing",
      product: "academy",
      language: "en",
      sectionTitle: "Academy Pricing",
      tags: ["academy", "pricing", "cost", "course"],
    },
  },

  // ACADEMY WHO IT'S FOR
  {
    content: `Symtri Academy is perfect for: Business owners curious about AI but don't know where to start, managers looking to improve team productivity, employees wanting to stay relevant in an AI workplace, companies considering AI automation solutions. NOT for: Developers wanting to build AI models from scratch, technical teams needing deep ML knowledge, people expecting to become AI engineers.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "academy",
      language: "en",
      sectionTitle: "Academy Target Audience",
      tags: ["academy", "audience", "who"],
    },
  },

  // ACADEMY CTA
  {
    content: `Ready to learn AI? Join the Symtri Academy waitlist at https://symtri.ai/academy to get early access and 50% off launch pricing. Email education@symtri.ai with questions. The course launches soon - first 10 students get founder pricing at $47.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "cta",
      product: "academy",
      language: "en",
      sectionTitle: "Academy CTA",
      tags: ["academy", "cta", "waitlist"],
    },
  },

  // ============================================================================
  // PRODUCT 2: LEAD RESPONSE
  // ============================================================================

  // LEAD RESPONSE OVERVIEW
  {
    content: `Lead Response by Symtri AI is a complete 24/7 AI lead capture system. Never miss another customer. Includes: AI phone answering (answers every call in 2 rings), website chat (captures leads while you sleep), missed call text-back (automatic SMS when you can't answer), appointment reminders (reduces no-shows by 40%), review requests (builds Google reviews on autopilot), and follow-up sequences (5 touches over 14 days). All bilingual (English/Spanish) from day one.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "service",
      product: "lead-response",
      language: "en",
      sectionTitle: "Lead Response Overview",
      tags: ["lead-response", "features", "phone", "chat", "sms"],
    },
  },

  // LEAD RESPONSE FEATURES - PHONE
  {
    content: `Lead Response AI Phone Answering: Answers every call within 2 rings, 24/7. Bilingual conversations in English, Spanish, and Spanglish. Schedules appointments directly to your calendar. Qualifies leads with custom questions. Smart routing - urgent calls transfer, others schedule callback. Full call transcripts delivered to your inbox. After-hours coverage so you never miss a lead. Emergency detection for urgent situations. CRM integration (HubSpot, Salesforce, Pipedrive).`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "service",
      product: "lead-response",
      language: "en",
      sectionTitle: "Lead Response Phone Features",
      tags: ["lead-response", "phone", "voice", "calls"],
    },
  },

  // LEAD RESPONSE FEATURES - CHAT
  {
    content: `Lead Response Website Chat: 24/7 AI chatbot on your website. Answers questions about your business instantly. Captures visitor contact info (name, email, phone). Books appointments via Calendly integration. Bilingual - automatically responds in visitor's language. Custom trained on your specific business. Smart lead routing - hot leads get SMS alerts, warm leads get email. Mobile-optimized for all devices. Analytics dashboard to track performance.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "service",
      product: "lead-response",
      language: "en",
      sectionTitle: "Lead Response Chat Features",
      tags: ["lead-response", "chat", "website", "chatbot"],
    },
  },

  // LEAD RESPONSE FEATURES - AUTOMATION
  {
    content: `Lead Response Automation Features: Missed call text-back - when you can't answer, automatic SMS goes out: "Sorry I missed your call, how can I help?" Appointment reminders - automated texts and emails reduce no-shows by 40%. Review requests - after each job, customers get friendly request to leave Google review. Follow-up sequences - 5-touch sequence over 14 days ensures no lead falls through cracks. All automated, all bilingual, works while you sleep.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "service",
      product: "lead-response",
      language: "en",
      sectionTitle: "Lead Response Automation",
      tags: ["lead-response", "automation", "sms", "follow-up"],
    },
  },

  // LEAD RESPONSE PRICING
  {
    content: `Lead Response pricing: $2,997 one-time setup (includes AI training, phone number, integrations, custom configuration). $497/month ongoing (includes all features: AI phone answering, website chat, missed call text-back, appointment reminders, review requests, follow-up sequences, bilingual EN+ES, monthly reports). No per-message fees. No hidden costs. No contracts - cancel anytime with 30 days notice.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "pricing",
      product: "lead-response",
      language: "en",
      sectionTitle: "Lead Response Pricing",
      tags: ["lead-response", "pricing", "cost"],
    },
  },

  // LEAD RESPONSE PRICING - SPANISH
  {
    content: `Precios de Lead Response: $2,997 configuración inicial (incluye entrenamiento de IA, número de teléfono, integraciones, configuración personalizada). $497/mes continuo (incluye todas las funciones: contestador telefónico IA, chat web, mensaje por llamada perdida, recordatorios de citas, solicitud de reseñas, secuencias de seguimiento, bilingüe EN+ES, reportes mensuales). Sin cargos por mensaje. Sin costos ocultos. Sin contratos.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "pricing",
      product: "lead-response",
      language: "es",
      sectionTitle: "Precios Lead Response",
      tags: ["lead-response", "pricing", "cost"],
    },
  },

  // LEAD RESPONSE DEMO
  {
    content: `Try Lead Response right now! Call (956) 692-1385 and talk to our AI assistant. Experience how it handles real conversations in English or Spanish. No appointment needed - call 24/7 to test it yourself. Or click the chat button on symtri.ai to test the website chat. See exactly what your customers would experience.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "cta",
      product: "lead-response",
      language: "en",
      sectionTitle: "Lead Response Demo",
      tags: ["lead-response", "demo", "trial", "call"],
    },
  },

  // LEAD RESPONSE TIMELINE
  {
    content: `Lead Response implementation: Live in 2 weeks. We handle everything - you just provide your business info. Week 1: Discovery call, AI training on your business, integrations setup. Week 2: Testing, refinements, go-live. Ongoing: We monitor and optimize. You focus on your work.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "lead-response",
      language: "en",
      sectionTitle: "Lead Response Timeline",
      tags: ["lead-response", "timeline", "implementation"],
    },
  },

  // LEAD RESPONSE CTA
  {
    content: `Ready to never miss another lead? Book a free 15-minute discovery call: https://calendly.com/andres-symtri/30min. Or email sales@symtri.ai. Or call (956) 692-1385 right now to experience our AI yourself. No pressure, no hard sell.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "cta",
      product: "lead-response",
      language: "en",
      sectionTitle: "Lead Response CTA",
      tags: ["lead-response", "cta", "contact"],
    },
  },

  // ============================================================================
  // PRODUCT 3: SECURE WORKSPACE
  // ============================================================================

  // SECURE WORKSPACE OVERVIEW
  {
    content: `Secure Workspace by Symtri AI is enterprise AI deployed in YOUR cloud. A ChatGPT-like experience for your employees, running entirely within your Azure or AWS environment. Full productivity. Full control. Full compliance. Your data never leaves your infrastructure. No training on your data. Complete audit logs. SSO integration. Perfect for companies with security, compliance, or data sovereignty requirements.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "service",
      product: "secure-workspace",
      language: "en",
      sectionTitle: "Secure Workspace Overview",
      tags: ["secure-workspace", "enterprise", "private-ai", "compliance"],
    },
  },

  // SECURE WORKSPACE PROBLEM
  {
    content: `The Shadow AI problem: Your employees are already using ChatGPT and Claude. Right now. Without oversight. Pasting customer data, financial info, proprietary code into consumer AI tools. 65% of knowledge workers use AI weekly. Most companies have no visibility into what data is being shared. Consumer AI tools can train on your data. You have zero audit trail. Secure Workspace solves this by bringing enterprise AI inside your firewall.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "service",
      product: "secure-workspace",
      language: "en",
      sectionTitle: "Shadow AI Problem",
      tags: ["secure-workspace", "shadow-ai", "security", "compliance"],
    },
  },

  // SECURE WORKSPACE FEATURES
  {
    content: `Secure Workspace features: Your Cloud, Your Data - deployed in YOUR Azure or AWS environment, data never leaves your infrastructure. SSO Integration - connects with Azure AD, Okta, Google Workspace, one-click login for employees. Complete Audit Trail - every prompt, every response, timestamped and user-attributed, exportable for compliance. No Training on Your Data - contractual guarantee your data is never used to train AI models. Usage Dashboard - see who's using AI, for what, how often, department-level analytics, cost tracking. We Handle Everything - setup, deployment, training, ongoing support. We are your AI team.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "service",
      product: "secure-workspace",
      language: "en",
      sectionTitle: "Secure Workspace Features",
      tags: ["secure-workspace", "features", "enterprise", "security"],
    },
  },

  // SECURE WORKSPACE PRICING
  {
    content: `Secure Workspace pricing: Discovery phase - $2,500 (1 week) - Current AI usage audit, security gap assessment, architecture recommendation, implementation roadmap, credited toward implementation. Implementation - $7,500-$15,000 (2-3 weeks) - Full workspace deployment, SSO integration, audit log setup, employee onboarding, admin training. Ongoing - $1,500-$4,000/month - Platform maintenance, security updates, model improvements, monthly reports, priority support. API costs (Claude/Azure OpenAI) billed separately at cost, typically $0.01-0.05 per conversation.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "pricing",
      product: "secure-workspace",
      language: "en",
      sectionTitle: "Secure Workspace Pricing",
      tags: ["secure-workspace", "pricing", "enterprise", "cost"],
    },
  },

  // SECURE WORKSPACE COMPLIANCE
  {
    content: `Secure Workspace compliance and security: Data residency - choose your region (US, EU, etc). SOC 2 aligned infrastructure. HIPAA-ready for healthcare organizations. Complete data sovereignty - you own everything. Contractual data protection guarantees. Regular security audits. No data retention on AI provider side. Business Associate Agreements available. Enterprise APIs with built-in protections (Claude Enterprise, Azure OpenAI).`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "service",
      product: "secure-workspace",
      language: "en",
      sectionTitle: "Secure Workspace Compliance",
      tags: ["secure-workspace", "compliance", "security", "hipaa", "soc2"],
    },
  },

  // SECURE WORKSPACE CTA
  {
    content: `Ready to secure your AI? Start with a Discovery engagement. No sales pitch - just a technical conversation about your needs. Book at https://calendly.com/andres-symtri/enterprise or email partners@symtri.ai. We also offer a free IT Security Checklist for AI Deployment - email partners@symtri.ai to request it.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "cta",
      product: "secure-workspace",
      language: "en",
      sectionTitle: "Secure Workspace CTA",
      tags: ["secure-workspace", "cta", "enterprise", "contact"],
    },
  },

  // ============================================================================
  // FAQS - SHARED
  // ============================================================================

  // FAQ - DIFFERENTIATORS
  {
    content: `How is Symtri AI different? (1) Bilingual by default - all products work in English, Spanish, and Spanglish, not an expensive add-on. (2) SMB-focused - affordable pricing for small businesses, not just enterprise. (3) Three clear products - Academy (learn), Lead Response (automate), Secure Workspace (protect). (4) Fast deployment - 24 hours to 3 weeks, not 6-month implementations. (5) We use our own products - our AI answers our calls and chats. (6) Direct access to founder - no sales teams, no ticket systems.`,
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
    content: `What industries does Symtri AI serve? Lead Response is great for: Healthcare (medical, dental, mental health), Professional services (law firms, accounting, insurance), Home services (HVAC, plumbing, roofing, pool services). Secure Workspace works for: Mid-size companies (50-500 employees), Regulated industries (healthcare, finance, legal), Companies with security/compliance requirements. Academy is for: Any business leader wanting to understand AI. Our bilingual capability makes us especially strong in Hispanic markets.`,
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
    content: `Do you require long-term contracts? No. Lead Response and Secure Workspace are month-to-month. Cancel anytime with 30 days notice. You own all your data and can export it. Academy courses are one-time purchases with lifetime access. We believe in earning your business every month, not locking you into contracts.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "shared",
      language: "en",
      sectionTitle: "Contracts and Cancellation",
      tags: ["faq", "contracts", "cancellation", "terms"],
    },
  },

  // FAQ - SPANISH SUPPORT
  {
    content: `Can you handle Spanish-speaking customers? Yes! This is our specialty. All products are bilingual from day one. Lead Response phone and chat respond fluently in Spanish and handle Spanglish code-switching naturally. Academy content available in Spanish. Secure Workspace supports multilingual teams. We're based in the Rio Grande Valley - we understand Hispanic markets. Most AI companies treat Spanish as an afterthought. For us, it's built in.`,
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
    content: `¿Pueden atender clientes que hablan español? ¡Sí! Esta es nuestra especialidad. Todos los productos son bilingües desde el primer día. Lead Response contesta en español fluido y maneja Spanglish naturalmente. Academia disponible en español. Secure Workspace soporta equipos multilingües. Estamos en el Valle del Río Grande - entendemos los mercados hispanos.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "shared",
      language: "es",
      sectionTitle: "Soporte en Español",
      tags: ["faq", "spanish", "bilingual", "language"],
    },
  },

  // FAQ - SECURITY
  {
    content: `How does Symtri AI handle data security? Enterprise Security for Every Business. All products: Encrypted in transit (TLS 1.3) and at rest (AES-256). SOC 2 aligned practices. HIPAA compliance available. No data sharing with third parties. Lead Response: Data stored in secure US-based servers, multi-tenant isolation. Secure Workspace: Your data stays in YOUR cloud - we never see it. Complete audit trails. Contractual guarantees against AI training on your data.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "shared",
      language: "en",
      sectionTitle: "Security and Compliance",
      tags: ["faq", "security", "hipaa", "compliance", "data"],
    },
  },

  // FAQ - INTEGRATIONS
  {
    content: `What tools does Symtri AI integrate with? Lead Response integrates with: CRMs (HubSpot, Salesforce, Pipedrive), Calendars (Google Calendar, Outlook, Calendly), Communication (Slack, Microsoft Teams), Automation (Zapier, Make.com, n8n). Secure Workspace integrates with: SSO providers (Azure AD, Okta, Google Workspace), Your existing cloud infrastructure (Azure, AWS). We handle all integration setup during onboarding.`,
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
    content: `What kind of support does Symtri AI provide? Direct access to the founder - no ticket systems, no waiting. Email support: hello@symtri.ai (24-hour response). Phone: (956) 692-1385 during business hours. White-glove onboarding for all customers. Lead Response includes monthly performance reviews. Secure Workspace includes priority support and quarterly check-ins. We're here to make sure you succeed.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "shared",
      language: "en",
      sectionTitle: "Support",
      tags: ["faq", "support", "help", "training"],
    },
  },

  // FAQ - ROI
  {
    content: `What's the ROI of Symtri AI products? Lead Response example: Service business missing 30% of after-hours calls = $15K/month in lost revenue. Lead Response at $497/month captures those leads = potential 30x ROI. Secure Workspace example: IT team spending 20 hours/month managing shadow AI concerns. Secure Workspace eliminates that overhead plus reduces compliance risk. Academy: One automation idea from the course could save hundreds of hours annually.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "shared",
      language: "en",
      sectionTitle: "ROI Examples",
      tags: ["faq", "roi", "savings", "value"],
    },
  },

  // ============================================================================
  // CTAs - SHARED
  // ============================================================================

  // CTA - GET STARTED
  {
    content: `Ready to get started with Symtri AI? For Academy: Join waitlist at symtri.ai/academy or email education@symtri.ai. For Lead Response: Book free discovery call at calendly.com/andres-symtri/30min or email sales@symtri.ai. For Secure Workspace: Schedule enterprise consultation at calendly.com/andres-symtri/enterprise or email partners@symtri.ai. Or call (956) 692-1385 anytime to talk to our AI and experience what we build.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "cta",
      product: "shared",
      language: "en",
      sectionTitle: "Get Started",
      tags: ["cta", "next steps", "contact"],
    },
  },

  // CTA - GET STARTED (SPANISH)
  {
    content: `¿Listo para empezar con Symtri AI? Para Academia: Únete a la lista de espera en symtri.ai/es/academy o escribe a education@symtri.ai. Para Lead Response: Agenda llamada gratis en calendly.com/andres-symtri/30min o escribe a sales@symtri.ai. Para Secure Workspace: Agenda consulta empresarial en calendly.com/andres-symtri/enterprise o escribe a partners@symtri.ai. O llama al (956) 692-1385 para hablar con nuestra IA.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "cta",
      product: "shared",
      language: "es",
      sectionTitle: "Empezar",
      tags: ["cta", "next steps", "contact"],
    },
  },

  // PRODUCT ROUTING
  {
    content: `Which Symtri AI product is right for you? Want to LEARN about AI and how to use it? → Academy ($197 course). Want to AUTOMATE lead capture with phone and chat AI? → Lead Response ($497/month). Want to PROTECT your company with private enterprise AI? → Secure Workspace (starting $2,500). Not sure? Call (956) 692-1385 or book a free consultation at calendly.com/andres-symtri/30min.`,
    options: {
      tenantId: SYMTRI_TENANT_ID,
      docType: "faq",
      product: "shared",
      language: "en",
      sectionTitle: "Product Comparison",
      tags: ["products", "comparison", "which product"],
    },
  },
];

// ============================================================================
// STEP 3: RUN INGESTION
// ============================================================================

async function ingestSymtriKnowledge() {
  console.log("🚀 Starting Symtri AI knowledge base ingestion...");
  console.log(`📦 Total chunks to ingest: ${symtriKnowledge.length}`);
  console.log("📝 Updated for 3-product model: Academy, Lead Response, Secure Workspace");

  // Tenant ID is configured
  console.log(`📍 Using tenant ID: ${SYMTRI_TENANT_ID}`);

  try {
    console.log("\n⏳ Ingesting knowledge chunks...");

    let successCount = 0;
    let errorCount = 0;

    for (const chunk of symtriKnowledge) {
      try {
        await knowledgeService.upsert(
          SYMTRI_TENANT_ID,
          chunk.options.product,
          chunk.options.language,
          chunk.content
        );
        successCount++;
        process.stdout.write(`\r✓ Ingested ${successCount}/${symtriKnowledge.length} chunks`);
      } catch (err) {
        errorCount++;
        console.error(`\n⚠️ Failed to ingest chunk: ${chunk.options.sectionTitle || 'unknown'}`);
      }
    }

    console.log(`\n\n✅ Ingested ${successCount} knowledge chunks`);
    if (errorCount > 0) {
      console.log(`⚠️ ${errorCount} chunks failed`);
    }

    console.log("\n🎉 Knowledge base setup complete!");
    console.log("SmartChat is now ready to answer questions about Symtri AI");
    console.log("\n📝 Test it with questions like:");
    console.log('  - "What products does Symtri AI offer?"');
    console.log('  - "How much does Lead Response cost?"');
    console.log('  - "Tell me about Symtri Academy"');
    console.log('  - "What is Secure Workspace?"');
    console.log('  - "¿Hablan español?"');
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
