import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * CORS headers for cross-origin requests from symtri.ai
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Validation schema for waitlist submission
 */
const WaitlistSchema = z.object({
  business_name: z.string().min(1, 'Business name is required').max(200),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().max(30).nullable().optional(),
  daily_calls: z.enum(['under_10', '10_50', '50_100', '100_plus']).nullable().optional(),
});

/**
 * OPTIONS /api/waitlist/phonebot
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: CORS_HEADERS });
}

/**
 * POST /api/waitlist/phonebot
 * Add a new entry to the PhoneBot waitlist
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = WaitlistSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const { business_name, email, phone, daily_calls } = validation.data;

    // Get Supabase admin client
    const supabase = getSupabaseAdmin();

    // Check if email already exists in waitlist
    const { data: existing } = await supabase
      .from('phonebot_waitlist')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Insert into waitlist
    const { data, error } = await supabase
      .from('phonebot_waitlist')
      .insert({
        business_name,
        email,
        phone: phone || null,
        daily_calls: daily_calls || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting waitlist entry:', error);
      return NextResponse.json(
        { error: 'Failed to join waitlist. Please try again.' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    console.log('PhoneBot waitlist entry created:', data.id);

    // Send email notification (don't let failure break signup)
    try {
      console.log('Starting email send...');
      console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

      const emailResult = await resend.emails.send({
        from: 'notifications@symtri.ai',
        to: 'andres@symtri.ai',
        subject: 'New PhoneBot Waitlist Signup',
        html: `
          <h2>New PhoneBot Waitlist Signup</h2>
          <p><strong>Business:</strong> ${business_name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Daily Calls:</strong> ${daily_calls || 'Not specified'}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p><a href="https://supabase.com/dashboard">View in Supabase</a></p>
        `
      });

      console.log('Email sent successfully:', emailResult);
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    return NextResponse.json(
      { success: true, message: 'Successfully joined the waitlist!' },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
