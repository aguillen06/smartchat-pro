import { resend, FROM_EMAIL } from './client'
import {
  getWaitlistEmailSubject,
  getWaitlistEmailHtml,
  getWaitlistEmailText,
  WaitlistEmailData,
} from './waitlist-templates'

export async function sendWaitlistEmail(data: WaitlistEmailData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping waitlist email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: getWaitlistEmailSubject(data.product),
      html: getWaitlistEmailHtml(data),
      text: getWaitlistEmailText(data),
    })

    if (error) {
      console.error('Failed to send waitlist email:', error)
      return { success: false, error: error.message }
    }

    console.log(`Waitlist email sent to ${data.email} for ${data.product}`)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error sending waitlist email:', message)
    return { success: false, error: message }
  }
}
