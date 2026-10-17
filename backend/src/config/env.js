const { z } = require('zod');
const dotenv = require('dotenv');
const path = require('path');

// Explicitly load .env from the backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });


const envSchema = z.object({
  PORT: z
    .string()
    .optional()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 65535, {
      message: 'PORT must be a valid port number between 1 and 65535',
    }),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .optional()
    .default('development'),
  CLIENT_ORIGIN: z
    .string()
    .optional()
    .default('http://localhost:3000'),
  DATABASE_URL: z
    .string()
    .min(1, { message: 'DATABASE_URL is required' }),
  JWT_SECRET: z
    .string()
    .min(32, { message: 'JWT_SECRET must be at least 32 characters long for security' })
    .refine((val) => {
      const insecureDefaults = [
        'your_super_secret_jwt_key_at_least_32_characters_long',
        'change_this_to_a_secure_secret_key_123',
        '12345678901234567890123456789012',
      ];
      return !insecureDefaults.includes(val);
    }, {
      message: 'Insecure or placeholder JWT_SECRET detected. Please provide a real secure secret in .env',
    }),
  JWT_EXPIRES_IN: z
    .string()
    .optional()
    .default('7d'),
  COOKIE_NAME: z
    .string()
    .optional()
    .default('gl_token'),

});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment configuration validation failed:');
  parsed.error.issues.forEach((issue) => {
    console.error(` - [${issue.path.join('.')}]: ${issue.message}`);
  });
  process.exit(1);
}

module.exports = parsed.data;
