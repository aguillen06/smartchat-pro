// Waitlist Welcome Email Templates

export interface WaitlistEmailData {
  businessName: string
  email: string
  product: string
  downloadUrl: string
}

const PRODUCT_NAMES: Record<string, string> = {
  leadflow: 'LeadFlow',
  processpilot: 'ProcessPilot',
  contentcraft: 'ContentCraft',
  phonebot: 'PhoneBot',
  smartchat: 'SmartChat',
  academy: 'Symtri Academy',
  'secure-workspace': 'Secure Workspace',
}

export function getWaitlistEmailSubject(product: string): string {
  const productName = PRODUCT_NAMES[product] || product
  return `You're on the ${productName} waitlist - Here's your free AI Readiness Checklist`
}

export function getWaitlistEmailHtml(data: WaitlistEmailData): string {
  const { businessName, product, downloadUrl } = data
  const productName = PRODUCT_NAMES[product] || product

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the ${productName} Waitlist</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFAFA; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAFAFA; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0A0A0A; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Anton', 'Arial Black', sans-serif; font-size: 28px; font-weight: 700; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.05em;">SYMTRI <span style="color: #6B6B6B;">AI</span></h1>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #6B6B6B; letter-spacing: 0.15em; text-transform: uppercase;">Intelligent Systems</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; font-family: 'Arial Black', sans-serif; font-size: 24px; font-weight: 700; color: #0A0A0A; text-transform: uppercase;">You're on the list!</h2>

              <p style="margin: 0 0 24px 0; color: #525252; font-size: 16px;">
                Hi ${businessName},
              </p>

              <p style="margin: 0 0 24px 0; color: #525252; font-size: 16px;">
                Thanks for joining the <strong>${productName}</strong> waitlist! We'll notify you as soon as it's ready for early access.
              </p>

              <p style="margin: 0 0 24px 0; color: #525252; font-size: 16px;">
                In the meantime, here's your free <strong>AI Readiness Checklist</strong> - a self-assessment to help you identify which AI automations will have the biggest impact on your business.
              </p>

              <!-- Download Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${downloadUrl}" style="display: inline-block; background-color: #0A0A0A; color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px; padding: 16px 32px; border-radius: 0;">
                      Download AI Readiness Checklist (PDF)
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What's Inside -->
              <div style="background-color: #F5F5F5; padding: 24px; margin: 24px 0; border-left: 4px solid #0A0A0A;">
                <h3 style="margin: 0 0 12px 0; font-family: 'Arial Black', sans-serif; font-size: 14px; font-weight: 700; color: #0A0A0A; text-transform: uppercase; letter-spacing: 0.1em;">What's Inside</h3>
                <ul style="margin: 0; padding-left: 20px; color: #525252; font-size: 15px;">
                  <li style="margin-bottom: 8px;">20-point self-assessment across 5 key areas</li>
                  <li style="margin-bottom: 8px;">Score yourself to see your AI readiness level</li>
                  <li style="margin-bottom: 8px;">Identify gaps before investing in AI solutions</li>
                  <li style="margin-bottom: 0;">Clear next steps based on your score</li>
                </ul>
              </div>

              <!-- CTA -->
              <p style="margin: 24px 0 16px 0; color: #525252; font-size: 16px;">
                <strong>Want to discuss your results?</strong> Book a free 30-minute consultation and we'll review your score together.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://calendly.com/andres-symtri/30min" style="display: inline-block; background-color: #FFFFFF; color: #0A0A0A; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border: 2px solid #0A0A0A;">
                      Schedule a Call
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #525252; font-size: 16px;">
                Talk soon,<br>
                <strong>Andres</strong><br>
                <span style="color: #6B6B6B;">Founder, Symtri AI</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F5F5F5; padding: 24px 40px; text-align: center; border-top: 1px solid #E8E8E8;">
              <p style="margin: 0 0 8px 0; color: #6B6B6B; font-size: 14px;">
                <strong>Symtri AI</strong> | Brownsville, Texas
              </p>
              <p style="margin: 0; color: #6B6B6B; font-size: 14px;">
                <a href="https://symtri.ai" style="color: #0A0A0A; text-decoration: none;">symtri.ai</a>
                &nbsp;|&nbsp;
                <a href="mailto:hello@symtri.ai" style="color: #0A0A0A; text-decoration: none;">hello@symtri.ai</a>
                &nbsp;|&nbsp;
                <a href="tel:9566921385" style="color: #0A0A0A; text-decoration: none;">(956) 692-1385</a>
              </p>
            </td>
          </tr>
        </table>

        <!-- Unsubscribe -->
        <p style="margin: 24px 0 0 0; color: #888888; font-size: 12px; text-align: center;">
          You're receiving this because you signed up for the ${productName} waitlist.<br>
          <a href="mailto:hello@symtri.ai?subject=Unsubscribe" style="color: #888888;">Unsubscribe</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export function getWaitlistEmailText(data: WaitlistEmailData): string {
  const { businessName, product, downloadUrl } = data
  const productName = PRODUCT_NAMES[product] || product

  return `
SYMTRI AI
=========

YOU'RE ON THE LIST!

Hi ${businessName},

Thanks for joining the ${productName} waitlist! We'll notify you as soon as it's ready for early access.

In the meantime, here's your free AI Readiness Checklist - a self-assessment to help you identify which AI automations will have the biggest impact on your business.

DOWNLOAD YOUR CHECKLIST
-----------------------
${downloadUrl}

WHAT'S INSIDE
-------------
- 20-point self-assessment across 5 key areas
- Score yourself to see your AI readiness level
- Identify gaps before investing in AI solutions
- Clear next steps based on your score

WANT TO DISCUSS YOUR RESULTS?
-----------------------------
Book a free 30-minute consultation:
https://calendly.com/andres-symtri/30min

Talk soon,
Andres
Founder, Symtri AI

---
Symtri AI | Brownsville, Texas
symtri.ai | hello@symtri.ai | (956) 692-1385

You're receiving this because you signed up for the ${productName} waitlist.
Reply to this email to unsubscribe.
`
}
