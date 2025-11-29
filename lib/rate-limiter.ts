// Simple in-memory rate limiter for signup protection
// In production, consider using Redis or a database for persistence

interface RateLimitEntry {
  count: number;
  firstAttempt: Date;
}

// Store attempts by IP address
const signupAttempts = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_ATTEMPTS = 5; // Maximum 5 signups per IP per hour

// Clean up old entries every hour
setInterval(() => {
  const now = new Date();
  for (const [ip, entry] of signupAttempts.entries()) {
    if (now.getTime() - entry.firstAttempt.getTime() > RATE_LIMIT_WINDOW) {
      signupAttempts.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

/**
 * Check if an IP address has exceeded the rate limit
 * @param ip The IP address to check
 * @returns Object with allowed status and remaining attempts
 */
export function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; resetTime: Date } {
  const now = new Date();
  const entry = signupAttempts.get(ip);

  if (!entry) {
    // First attempt from this IP
    signupAttempts.set(ip, {
      count: 1,
      firstAttempt: now,
    });
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS - 1,
      resetTime: new Date(now.getTime() + RATE_LIMIT_WINDOW),
    };
  }

  // Check if window has expired
  if (now.getTime() - entry.firstAttempt.getTime() > RATE_LIMIT_WINDOW) {
    // Reset the counter
    signupAttempts.set(ip, {
      count: 1,
      firstAttempt: now,
    });
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS - 1,
      resetTime: new Date(now.getTime() + RATE_LIMIT_WINDOW),
    };
  }

  // Within the rate limit window
  if (entry.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: new Date(entry.firstAttempt.getTime() + RATE_LIMIT_WINDOW),
    };
  }

  // Increment counter
  entry.count++;
  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - entry.count,
    resetTime: new Date(entry.firstAttempt.getTime() + RATE_LIMIT_WINDOW),
  };
}

/**
 * Get the client's IP address from the request
 * Works with various proxy configurations
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;

  // Try various headers that might contain the real IP
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for may contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a default if we can't determine the IP
  // In production, you might want to handle this differently
  return 'unknown';
}