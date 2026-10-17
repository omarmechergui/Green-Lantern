const { z } = require('zod');

// Schema for reviewing/approving a waste declaration
const reviewDeclarationSchema = z
  .object({
    status: z.enum(['APPROVED', 'REJECTED'], {
      required_error: 'Status is required (APPROVED or REJECTED)',
    }),
    rejectionReason: z
      .string()
      .trim()
      .max(500, 'Rejection reason must not exceed 500 characters')
      .optional(),
    acceptedWeight: z
      .number({ invalid_type_error: 'Accepted weight must be a valid number' })
      .positive('Accepted weight must be greater than 0')
      .max(10000, 'Accepted weight cannot exceed 10,000 kg')
      .optional(),
    centerId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid collection center ID format')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'APPROVED') {
      if (
        data.acceptedWeight === undefined ||
        data.acceptedWeight === null ||
        !Number.isFinite(data.acceptedWeight) ||
        data.acceptedWeight <= 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['acceptedWeight'],
          message: 'A valid positive accepted weight is strictly required when approving a declaration.',
        });
      }
    }
  });

module.exports = {
  reviewDeclarationSchema,
};

