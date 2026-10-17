const { z } = require('zod');

// Citizen Registration Schema
const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'A valid email address is required' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(128, { message: 'Password cannot exceed 128 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one digit' }),
  fullName: z
    .string()
    .trim()
    .min(2, { message: 'Full name must be at least 2 characters long' })
    .max(100, { message: 'Full name cannot exceed 100 characters' }),
  phone: z
    .string()
    .trim()
    .optional(),
  avatar: z
    .string()
    .trim()
    .url({ message: 'Avatar must be a valid URL' })
    .optional(),
});

// Citizen Login Schema
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'A valid email address is required' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
