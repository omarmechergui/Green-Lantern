const express = require('express');
const rewardController = require('../controllers/reward.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { redeemRewardSchema } = require('../validations/reward.validation');

const router = express.Router();

// GET /api/rewards — Public/Authenticated: get active rewards
router.get('/', rewardController.getRewards);

// POST /api/rewards/redeem — Authenticated: redeem a reward
router.post(
  '/redeem',
  authenticate,
  validate(redeemRewardSchema),
  rewardController.redeemReward
);

// GET /api/rewards/redemptions — Authenticated: get user's redemptions
router.get('/redemptions', authenticate, rewardController.getUserRedemptions);

module.exports = router;
