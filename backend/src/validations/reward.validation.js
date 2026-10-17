const { z } = require('zod');

const redeemRewardSchema = z.object({
  rewardId: z
    .string({ required_error: 'Reward ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid reward ID format'),
  notes: z
    .string()
    .trim()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional(),
});

module.exports = {
  redeemRewardSchema,
};
