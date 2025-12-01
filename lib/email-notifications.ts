import { Resend } from 'resend';

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
  console.log('📬 [Email] sendSignupNotification called with:', {
    userEmail: data.userEmail,
    fullName: data.fullName,
    ipAddress: data.ipAddress,
    timestamp: data.timestamp.toISOString(),
  });

  // Check if API key exists at runtime
  const resendApiKey = process.env.RESEND_API_KEY;
  console.log('🔑 [Email] API Key exists:', !!resendApiKey);
  console.log('🔑 [Email] API Key length:', resendApiKey?.length || 0);
  console.log('🔑 [Email] API Key starts with:', resendApiKey?.substring(0, 3));

  if (!resendApiKey) {
    console.log('⚠️  [Email] RESEND_API_KEY not found in environment variables');
    console.log('📌 To enable email notifications:');
    console.log('   1. Add RESEND_API_KEY to your .env.local file');
    console.log('   2. Get your API key from https://resend.com/api-keys');
    console.log('   3. Add: RESEND_API_KEY=re_xxxxxxxxxxxxx');
    console.log('');
    console.log('📮 Email would be sent to: andres@symtri.ai');
    console.log('📮 From: Symtri AI <notifications@symtri.ai>');
    return { success: false, message: 'RESEND_API_KEY not configured' };
  }

  // Initialize Resend with API key
  const resend = new Resend(resendApiKey);

  try {
    // Format the timestamp for the email
    const formattedTime = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'America/New_York',
    }).format(data.timestamp);

    // Get location info if available
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
      console.log('🔗 [Email] Webhook URL configured, attempting webhook...');
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
          console.log('✅ [Email] Webhook notification sent successfully');
        } else {
          console.log('⚠️ [Email] Webhook failed:', webhookResponse.status);
        }
      } catch (webhookError) {
        console.error('❌ [Email] Webhook notification failed:', webhookError);
      }
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

    // Send the email using Resend with verified domain
    console.log('📤 [Email] Sending email with Resend...');
    console.log('📤 [Email] Parameters:', {
      from: 'Symtri AI <notifications@symtri.ai>',
      to: 'andres@symtri.ai',
      subject: `New SmartChat Signup: ${data.userEmail}`,
    });

    // Use proper destructuring for Resend response
    const { data: emailData, error } = await resend.emails.send({
      from: 'Symtri AI <notifications@symtri.ai>',  // Using verified domain
      to: 'andres@symtri.ai',
      subject: `New SmartChat Signup: ${data.userEmail}`,
      html: emailHtml,
      text: `New SmartChat user signup:\n\nEmail: ${data.userEmail}\nName: ${data.fullName}\nSignup Timestamp: ${formattedTime}\n\nAdditional Details:\nIP Address: ${data.ipAddress}\nLocation: ${locationInfo}`,
    });

    // Check for Resend error
    if (error) {
      console.error('❌ [Email] Resend returned error:', error);
      console.error('❌ [Email] Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message || 'Failed to send email' };
    }

    // Success!
    console.log('✅ [Email] Email sent successfully!');
    console.log('✅ [Email] Resend response data:', emailData);
    console.log('✅ [Email] Email ID:', emailData?.id);

    return { success: true, messageId: emailData?.id, data: emailData };

  } catch (error: any) {
    // Log error but don't fail the signup if email fails
    console.error('❌ [Email] Exception caught while sending email:', error);
    console.error('❌ [Email] Error type:', error.constructor.name);
    console.error('❌ [Email] Error message:', error.message);
    console.error('❌ [Email] Error stack:', error.stack);

    return { success: false, error: error.message || 'Unknown error occurred' };
  }
}