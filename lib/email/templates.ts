// SmartChat Email Templates

export interface WelcomeEmailData {
  customerName?: string
  email: string
  dashboardUrl: string
}

export function getWelcomeEmailSubject(): string {
  return 'Welcome to SmartChat - Let\'s Get Your AI Chatbot Live!'
}

export function getWelcomeEmailHtml(data: WelcomeEmailData): string {
  const { customerName, dashboardUrl } = data
  const greeting = customerName ? `Hi ${customerName}` : 'Hi there'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SmartChat</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFAFA; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAFAFA; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #18181B; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 28px; font-weight: 700; color: #FFFFFF;">SMARTCHAT</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #71717A; letter-spacing: 0.1em; text-transform: uppercase;">By Symtri AI</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 600; color: #18181B;">Welcome to SmartChat!</h2>

              <p style="margin: 0 0 24px 0; color: #52525B; font-size: 16px;">
                ${greeting},
              </p>

              <p style="margin: 0 0 24px 0; color: #52525B; font-size: 16px;">
                Thank you for subscribing to SmartChat! Your AI-powered chatbot is ready to help you capture leads, answer questions, and book appointments 24/7.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; background-color: #18181B; color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px;">
                      Go to Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <div style="background-color: #F4F4F5; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 600; color: #18181B;">Getting Started</h3>
                <ol style="margin: 0; padding-left: 20px; color: #52525B;">
                  <li style="margin-bottom: 8px;">Log into your dashboard to customize your chatbot</li>
                  <li style="margin-bottom: 8px;">Add your business knowledge so it can answer questions accurately</li>
                  <li style="margin-bottom: 8px;">Copy the widget code and add it to your website</li>
                  <li style="margin-bottom: 0;">Start capturing leads while you sleep!</li>
                </ol>
              </div>

              <p style="margin: 24px 0 0 0; color: #52525B; font-size: 16px;">
                Need help getting set up? Just reply to this email and we'll assist you personally.
              </p>

              <p style="margin: 24px 0 0 0; color: #52525B; font-size: 16px;">
                Welcome aboard!<br>
                <strong>The Symtri AI Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F4F4F5; padding: 24px 40px; text-align: center; border-top: 1px solid #E4E4E7;">
              <p style="margin: 0 0 8px 0; color: #71717A; font-size: 14px;">
                <strong>Symtri AI</strong> | Brownsville, Texas
              </p>
              <p style="margin: 0; color: #71717A; font-size: 14px;">
                <a href="https://smartchat.symtri.ai" style="color: #18181B; text-decoration: none;">smartchat.symtri.ai</a>
                &nbsp;|&nbsp;
                <a href="mailto:hello@symtri.ai" style="color: #18181B; text-decoration: none;">hello@symtri.ai</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export function getWelcomeEmailText(data: WelcomeEmailData): string {
  const { customerName, dashboardUrl } = data
  const greeting = customerName ? `Hi ${customerName}` : 'Hi there'

  return `
SMARTCHAT by Symtri AI
======================

Welcome to SmartChat!

${greeting},

Thank you for subscribing to SmartChat! Your AI-powered chatbot is ready to help you capture leads, answer questions, and book appointments 24/7.

Go to your dashboard: ${dashboardUrl}

GETTING STARTED
---------------
1. Log into your dashboard to customize your chatbot
2. Add your business knowledge so it can answer questions accurately
3. Copy the widget code and add it to your website
4. Start capturing leads while you sleep!

Need help getting set up? Just reply to this email and we'll assist you personally.

Welcome aboard!
The Symtri AI Team

---
Symtri AI | Brownsville, Texas
smartchat.symtri.ai | hello@symtri.ai
`
}
