import { z } from 'zod';

export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const phoneSchema = z
  .string()
  .trim()
  .min(6, 'Enter a valid phone number')
  .max(20)
  .optional()
  .or(z.literal(''))
  .transform((value) => (value ? value : undefined));

const optionalUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .optional()
  .or(z.literal(''))
  .transform((value) => (value ? value : undefined));

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
  phone: phoneSchema,
});

export const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().email().optional(),
    phone: phoneSchema,
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
