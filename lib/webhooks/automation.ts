import crypto from 'crypto'

const AUTOMATION_WEBHOOK_URL = process.env.AUTOMATION_WEBHOOK_URL || 'https://automation.symtri.ai/api/webhooks/smartchat'
const WEBHOOK_SECRET = process.env.SMARTCHAT_WEBHOOK_SECRET || ''

type SmartChatEvent =
  | 'new_lead'
  | 'conversation_ended'
  | 'escalation_requested'
  | 'appointment_booked'
  | 'high_intent_detected'

interface WebhookPayload {
  event: SmartChatEvent
  timestamp: string
  data: Record<string, unknown>
}

/**
 * Send event to Symtri Automation Hub
 */
export async function sendToAutomationHub(
  event: SmartChatEvent,
  data: Record<string, unknown>
): Promise<boolean> {
  if (!WEBHOOK_SECRET) {
    console.warn('SMARTCHAT_WEBHOOK_SECRET not configured - skipping webhook')
    return false
  }

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data
  }

  const body = JSON.stringify(payload)

  // Create HMAC signature
  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex')

  try {
    const response = await fetch(AUTOMATION_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SmartChat-Signature': signature
      },
      body
    })

    if (!response.ok) {
      console.error(`Automation webhook failed: ${response.status}`)
      return false
    }

    console.log(`Automation webhook sent: ${event}`)
    return true
  } catch (error) {
    console.error('Automation webhook error:', error)
    return false
  }
}

/**
 * Send new lead event
 */
export async function notifyNewLead(lead: {
  name?: string
  email?: string
  phone?: string
  company?: string
  source?: string
  score?: number
  messages?: string[]
  sessionId?: string
}) {
  return sendToAutomationHub('new_lead', lead)
}

/**
 * Send conversation ended event
 */
export async function notifyConversationEnded(data: {
  sessionId: string
  messages: Array<{ role: string; content: string }>
  duration: number
  leadCaptured: boolean
}) {
  return sendToAutomationHub('conversation_ended', data)
}

/**
 * Send escalation request event
 */
export async function notifyEscalationRequested(data: {
  sessionId: string
  name?: string
  phone?: string
  email?: string
  reason: string
  messages: Array<{ role: string; content: string }>
}) {
  return sendToAutomationHub('escalation_requested', data)
}
