import { resend, FROM_EMAIL } from './client'
import {
  getWelcomeEmailSubject,
  getWelcomeEmailHtml,
  getWelcomeEmailText,
  WelcomeEmailData,
} from './templates'

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping welcome email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: getWelcomeEmailSubject(),
      html: getWelcomeEmailHtml(data),
      text: getWelcomeEmailText(data),
    })

    if (error) {
      console.error('Failed to send welcome email:', error)
      return { success: false, error: error.message }
    }

    console.log(`Welcome email sent to ${data.email}`)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error sending welcome email:', message)
    return { success: false, error: message }
  }
}
