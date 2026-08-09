import { z } from 'zod';

export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

/**
 * Phone is half of the sign-in credential, so it is stored as a bare 10-digit
 * number. Accepts what people actually type (+91, spaces, dashes, leading 0),
 * strips it down, and rejects anything that isn't a valid Indian mobile.
 */
export const phoneSchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value).replace(/[\s\-()]/g, ''))
  .transform((value) => value.replace(/^(\+?91|0)/, ''))
  .refine((value) => /^[6-9]\d{9}$/.test(value), {
    message: 'Enter a valid 10-digit mobile number',
  })
  .transform((value) => Number(value));

const optionalPhoneSchema = z
  .union([z.string(), z.number()])
  .optional()
  .or(z.literal(''))
  .transform((value) => (value === '' || value === undefined ? undefined : value))
  .pipe(phoneSchema.optional());

const optionalUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .optional()
  .or(z.literal(''))
  .transform((value) => (value ? value : undefined));

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  phone: phoneSchema,
});

/** Sign-in credential: email + phone, no password. */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  phone: phoneSchema,
});

export const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().email().optional(),
    phone: optionalPhoneSchema,
    profileImage: optionalUrlSchema,
    defaultAddressId: objectIdSchema.optional().nullable(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: 'At least one field is required',
  });

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(50).default('Home'),
  street: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  zipCode: z.string().trim().min(3).max(20),
  country: z.string().trim().min(2).max(80).default('India'),
  isDefault: z.boolean().optional().default(false),
});

export const productAvailabilityQuerySchema = z.object({
  rentalStart: z.string().trim().optional(),
  rentalEnd: z.string().trim().optional(),
  quantity: z.coerce.number().int().positive().optional(),
});

export const cartItemSchema = z.object({
  productId: objectIdSchema,
  quantity: z.coerce.number().int().positive().default(1),
  rentalStart: z.string().trim().min(1),
  rentalEnd: z.string().trim().min(1),
});

export const cartUpdateSchema = z.object({
  quantity: z.coerce.number().int().positive(),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  deliveryMethod: z.enum(['delivery', 'pickup']),
  deliveryAddressId: z.string().trim().min(1).optional().nullable(),
  paymentMethod: z.string().trim().min(2).max(50),
  // 'cod' settles on delivery; 'online' is routed through Cashfree and stays
  // unfulfilled until a payment is verified server-side.
  paymentMode: z.enum(['cod', 'online']).default('cod'),
});

export const bookingDraftSchema = checkoutSchema.omit({ paymentMethod: true });

export const bookingActionSchema = z.object({
  action: z.enum(['cancel', 'confirm_pickup', 'return']),
  returnCondition: z.string().trim().max(200).optional(),
  damageNotes: z.string().trim().max(500).optional(),
  missingAccessories: z.array(z.string().trim().min(1).max(120)).optional(),
});

export const wishlistSchema = z.object({
  productId: objectIdSchema,
});

export function getValidationErrorMessage(error: z.ZodError) {
  return error.issues.map((issue) => issue.message).join(', ');
}
