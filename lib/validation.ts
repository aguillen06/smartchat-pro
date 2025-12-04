import { z } from 'zod';

/**
 * Centralized validation schemas using Zod
 * This file contains all validation schemas for forms and API routes
 */

// Common validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-\+\(\)]+$/;
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Sanitization helper to prevent XSS
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 10000); // Limit to reasonable length
}

// Auth Schemas
export const SignupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email must not exceed 255 characters')
    .email('Invalid email address')
    .regex(EMAIL_REGEX, 'Invalid email format')
    .transform(sanitizeString),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must not exceed 128 characters'),
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must not exceed 100 characters')
    .transform(sanitizeString),
});

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .transform(sanitizeString),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const ResetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .transform(sanitizeString),
});

export const UpdatePasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must not exceed 128 characters'),
  confirmPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must not exceed 128 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Chat Schemas
export const ChatRequestSchema = z.object({
  widgetKey: z
    .string()
    .min(1, 'Widget key is required')
    .max(100, 'Widget key must not exceed 100 characters')
    .transform(sanitizeString),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(5000, 'Message must not exceed 5000 characters')
    .transform(sanitizeString),
  visitorId: z
    .string()
    .min(1, 'Visitor ID is required')
    .max(100, 'Visitor ID must not exceed 100 characters')
    .transform(sanitizeString),
  conversationId: z
    .string()
    .regex(UUID_REGEX, 'Invalid conversation ID format')
    .optional(),
});

// Widget Schemas
export const CreateWidgetSchema = z.object({
  name: z
    .string()
    .min(3, 'Widget name must be at least 3 characters')
    .max(100, 'Widget name must not exceed 100 characters')
    .transform(sanitizeString),
  welcomeMessage: z
    .string()
    .min(10, 'Welcome message must be at least 10 characters')
    .max(500, 'Welcome message must not exceed 500 characters')
    .transform(sanitizeString),
  primaryColor: z
    .string()
    .regex(HEX_COLOR_REGEX, 'Invalid color format. Must be a hex color like #0D9488')
    .optional()
    .default('#0D9488'),
  businessDescription: z
    .string()
    .max(2000, 'Business description must not exceed 2000 characters')
    .transform(sanitizeString)
    .optional()
    .default(''),
});

export const UpdateWidgetSchema = z.object({
  widgetId: z
    .string()
    .regex(UUID_REGEX, 'Invalid widget ID format'),
  name: z
    .string()
    .min(3, 'Widget name must be at least 3 characters')
    .max(100, 'Widget name must not exceed 100 characters')
    .transform(sanitizeString)
    .optional(),
  welcomeMessage: z
    .string()
    .min(10, 'Welcome message must be at least 10 characters')
    .max(500, 'Welcome message must not exceed 500 characters')
    .transform(sanitizeString)
    .optional(),
  primaryColor: z
    .string()
    .regex(HEX_COLOR_REGEX, 'Invalid color format')
    .optional(),
  businessDescription: z
    .string()
    .max(2000, 'Business description must not exceed 2000 characters')
    .transform(sanitizeString)
    .optional(),
  settings: z.any().optional(), // Settings can be complex nested objects
});

export const WidgetKeySchema = z.object({
  key: z
    .string()
    .min(1, 'Widget key is required')
    .max(100, 'Widget key must not exceed 100 characters')
    .transform(sanitizeString),
});

export const UpdateWidgetByKeySchema = z.object({
  name: z
    .string()
    .max(100, 'Widget name must not exceed 100 characters')
    .transform(sanitizeString)
    .optional(),
  welcome_message: z
    .string()
    .max(500, 'Welcome message must not exceed 500 characters')
    .transform(sanitizeString)
    .optional(),
  primary_color: z
    .string()
    .regex(HEX_COLOR_REGEX, 'Invalid color format')
    .optional(),
  ai_instructions: z
    .string()
    .max(5000, 'AI instructions must not exceed 5000 characters')
    .transform(sanitizeString)
    .nullable()
    .optional(),
});

// Knowledge Base Schemas
export const CreateKnowledgeDocSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .transform(sanitizeString),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(50000, 'Content must not exceed 50000 characters')
    .transform(sanitizeString),
});

export const UpdateKnowledgeDocSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .transform(sanitizeString),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(50000, 'Content must not exceed 50000 characters')
    .transform(sanitizeString),
});

export const KnowledgeDocIdSchema = z.object({
  id: z
    .string()
    .regex(UUID_REGEX, 'Invalid knowledge doc ID format'),
});

// Lead Schemas
export const CreateLeadSchema = z.object({
  conversationId: z
    .string()
    .regex(UUID_REGEX, 'Invalid conversation ID format'),
  widgetId: z
    .string()
    .regex(UUID_REGEX, 'Invalid widget ID format'),
  name: z
    .string()
    .max(100, 'Name must not exceed 100 characters')
    .transform(sanitizeString)
    .optional()
    .nullable(),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters')
    .transform(sanitizeString)
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(PHONE_REGEX, 'Invalid phone number format')
    .max(30, 'Phone must not exceed 30 characters')
    .transform(sanitizeString)
    .optional()
    .nullable(),
  source: z
    .string()
    .max(50, 'Source must not exceed 50 characters')
    .transform(sanitizeString)
    .optional()
    .default('chat_prompt'),
}).refine((data) => data.email || data.phone, {
  message: 'At least email or phone is required',
  path: ['email'],
});

// Type exports for TypeScript
export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ChatRequestInput = z.infer<typeof ChatRequestSchema>;
export type CreateWidgetInput = z.infer<typeof CreateWidgetSchema>;
export type UpdateWidgetInput = z.infer<typeof UpdateWidgetSchema>;
export type CreateKnowledgeDocInput = z.infer<typeof CreateKnowledgeDocSchema>;
export type UpdateKnowledgeDocInput = z.infer<typeof UpdateKnowledgeDocSchema>;
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;

/**
 * Helper function to validate and return parsed data or error response
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string; details?: any } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError.message,
        details: error.errors,
      };
    }
    return {
      success: false,
      error: 'Validation failed',
    };
  }
}
