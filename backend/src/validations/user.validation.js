const { z } = require('zod');

const updateProfileSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9\s-]{8,20}$/, 'Invalid phone number format')
    .optional()
    .nullable(),
  avatar: z
    .string()
    .trim()
    .url('Avatar must be a valid URL')
    .max(500, 'Avatar URL cannot exceed 500 characters')
    .optional()
    .nullable(),
});

module.exports = {
  updateProfileSchema,
};
