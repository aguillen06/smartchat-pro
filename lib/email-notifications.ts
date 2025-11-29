import { Resend } from 'resend';

// Initialize Resend with API key (optional - will log if not configured)
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface SignupNotificationData {
  userEmail: string;
  fullName: string;
  ipAddress: string;
  timestamp: Date;
  userAgent?: string;
  location?: string;
}

/**
 * Send email notification to admin when a new user signs up
 */
export async function sendSignupNotification(data: SignupNotificationData) {
  try {
    // Format the timestamp for the email
    const formattedTime = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'America/New_York',
    }).format(data.timestamp);

    // Get location info if available (could be enhanced with IP geolocation service)
    const locationInfo = data.location || 'Not determined';

    // Log the signup notification details
    console.log('\n=== NEW USER SIGNUP NOTIFICATION ===');
    console.log(`📧 Email to andres@symtri.ai:`);
    console.log(`Subject: New SmartChat Signup: ${data.userEmail}`);
    console.log('---');
    console.log(`Email: ${data.userEmail}`);
    console.log(`Name: ${data.fullName}`);
    console.log(`IP Address: ${data.ipAddress}`);
    console.log(`Timestamp: ${formattedTime}`);
    console.log(`Location: ${locationInfo}`);
    if (data.userAgent) {
      console.log(`User Agent: ${data.userAgent}`);
    }
    console.log('=====================================\n');

    // Try webhook notification first (if configured)
    const webhookUrl = process.env.SIGNUP_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'new_signup',
            to: 'andres@symtri.ai',
            subject: `New SmartChat Signup: ${data.userEmail}`,
            user: {
              email: data.userEmail,
              name: data.fullName,
              ip: data.ipAddress,
              timestamp: formattedTime,
              location: locationInfo,
              userAgent: data.userAgent,
            },
          }),
        });

        if (webhookResponse.ok) {
          console.log('✅ Webhook notification sent successfully');
        }
      } catch (webhookError) {
        console.error('Webhook notification failed:', webhookError);
      }
    }

    // If Resend is not configured, try alternative notification methods
    if (!resend) {
      console.log('⚠️  Resend API key not configured.');
      console.log('📌 To enable email notifications:');
      console.log('   1. Add RESEND_API_KEY to your .env file');
      console.log('   2. Or add SIGNUP_WEBHOOK_URL for webhook notifications');
      console.log('');
      console.log('📮 Email would be sent to: andres@symtri.ai');
      return { success: true, message: 'Notification logged (configure RESEND_API_KEY or SIGNUP_WEBHOOK_URL for email delivery)' };
    }

    // Build the email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #14b8a6 0%, #84cc16 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="color: white; margin: 0;">New User Signup Alert</h2>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
            A new user has signed up for <strong>Symtri AI SmartChat</strong>:
          </p>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${data.userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600;">Full Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${data.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600;">IP Address:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${data.ipAddress}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600;">Timestamp:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${formattedTime}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600;">Location:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${locationInfo}</td>
            </tr>
            ${data.userAgent ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600;">User Agent:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 12px;">${data.userAgent}</td>
            </tr>
            ` : ''}
          </table>

          <div style="margin-top: 30px; padding: 15px; background: #f0fdf4; border-left: 4px solid #14b8a6; border-radius: 4px;">
            <p style="color: #14532d; margin: 0; font-size: 14px;">
              <strong>Action Required:</strong> Review this signup for any suspicious activity.
              If this appears to be spam or fraudulent, consider blocking the IP address.
            </p>
          </div>
        </div>
      </div>
    `;

    // Send the email with simplified format as requested
    const result = await resend.emails.send({
      from: 'Symtri AI SmartChat <notifications@symtri.ai>',
      to: 'andres@symtri.ai',
      subject: `New SmartChat Signup: ${data.userEmail}`,
      html: emailHtml,
      text: `New SmartChat user signup:\n\nEmail: ${data.userEmail}\nName: ${data.fullName}\nSignup Timestamp: ${formattedTime}\n\nAdditional Details:\nIP Address: ${data.ipAddress}\nLocation: ${locationInfo}`,
    });

    console.log('Signup notification sent successfully:', result);
    return { success: true, messageId: (result as any).id || 'sent' };
  } catch (error) {
    // Log error but don't fail the signup if email fails
    console.error('Failed to send signup notification email:', error);
    return { success: false, error };
  }
}