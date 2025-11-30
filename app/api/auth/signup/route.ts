export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { sendSignupNotification } from '@/lib/email-notifications';

export async function POST(request: NextRequest) {
  try {
    // Get client IP address
    const clientIp = getClientIp(request);

    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIp);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many signup attempts',
          message: `You have exceeded the maximum number of signups. Please try again after ${rateLimitResult.resetTime.toLocaleTimeString()}.`,
          resetTime: rateLimitResult.resetTime,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
            'Retry-After': Math.ceil(
              (rateLimitResult.resetTime.getTime() - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // Parse request body
    const { email, password, fullName } = await request.json();

    // Validate input
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Get user agent for logging
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Create user with Supabase Admin SDK
    const supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // User needs to confirm email
      user_metadata: {
        full_name: fullName,
        signup_ip: clientIp,
        signup_timestamp: new Date().toISOString(),
      },
    });

    if (authError) {
      console.error('Signup error:', authError);

      // Handle specific error cases
      if (authError.message?.includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: authError.message || 'Failed to create account' },
        { status: 400 }
      );
    }

    // Note: Supabase automatically sends confirmation email when creating a user
    // with email_confirm: false, so we don't need to manually send it

    // Send admin notification email (non-blocking)
    console.log('📨 [Signup] Attempting to send admin notification email...');
    sendSignupNotification({
      userEmail: email,
      fullName,
      ipAddress: clientIp,
      timestamp: new Date(),
      userAgent,
      location: request.headers.get('cf-ipcountry') || undefined,
    })
      .then((result) => {
        if (result.success) {
          console.log('✅ [Signup] Admin notification sent successfully:', result);
        } else {
          console.log('⚠️ [Signup] Admin notification failed:', result);
        }
      })
      .catch((err) => {
        console.error('❌ [Signup] Failed to send admin notification:', err);
        console.error('Stack trace:', err.stack);
      });

    // Log signup for monitoring
    console.log('🎉 [Signup] New user signup successful:', {
      email,
      fullName,
      ip: clientIp,
      timestamp: new Date().toISOString(),
      notificationTargetEmail: 'andres@symtri.ai',
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.',
        remainingSignups: rateLimitResult.remainingAttempts,
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remainingAttempts.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
        },
      }
    );
  } catch (error: any) {
    console.error('Signup API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}