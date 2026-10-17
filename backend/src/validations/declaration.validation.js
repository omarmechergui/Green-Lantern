const { z } = require('zod');

// POST /api/waste-declarations — Create a new waste declaration
const createDeclarationSchema = z.object({
  wasteCategoryId: z
    .string()
    .trim()
    .min(1, { message: 'Waste category is required' }),
  deliveryMethod: z
    .enum(['DROP_OFF', 'PICKUP'], {
      errorMap: () => ({ message: 'Delivery method must be DROP_OFF or PICKUP' }),
    }),
  estimatedWeight: z
    .number({ invalid_type_error: 'Weight must be a number' })
    .positive({ message: 'Weight must be a positive number' })
    .max(10000, { message: 'Weight cannot exceed 10,000 kg' }),
  description: z
    .string()
    .trim()
    .max(1000, { message: 'Description cannot exceed 1000 characters' })
    .optional()
    .default(''),
  pickupAddress: z
    .string()
    .trim()
    .max(500, { message: 'Pickup address cannot exceed 500 characters' })
    .optional(),
  pickupLatitude: z
    .number()
    .min(-90)
    .max(90)
    .optional(),
  pickupLongitude: z
    .number()
    .min(-180)
    .max(180)
    .optional(),
  preferredPickupTime: z
    .string()
    .datetime({ message: 'Preferred pickup time must be a valid ISO 8601 date' })
    .optional(),
});

module.exports = {
  createDeclarationSchema,
};
