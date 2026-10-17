const prisma = require('../db');

/**
 * Get active rewards catalog.
 * Route: GET /api/rewards
 */
async function getRewards(req, res, next) {
  try {
    const rewards = await prisma.reward.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        pointsCost: true,
        stock: true,
        createdAt: true,
      },
      orderBy: { pointsCost: 'asc' },
    });

    return res.status(200).json({
      status: 'success',
      data: { rewards },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Redeem a reward for the authenticated user.
 * Server-authoritative balance check, stock check, atomic transaction.
 * Route: POST /api/rewards/redeem
 */
async function redeemReward(req, res, next) {
  try {
    const userId = req.user.id;
    const { rewardId, notes } = req.body;

    // MongoDB Atlas interactive transaction for atomic balance check, stock deduction, and ledger creation
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current reward to verify existence, active status, and get authoritative cost
      const reward = await tx.reward.findUnique({
        where: { id: rewardId },
      });

      if (!reward || !reward.isActive) {
        throw { statusCode: 404, message: 'Reward not found or inactive.' };
      }

      if (reward.stock <= 0) {
        throw { statusCode: 400, message: 'Reward is currently out of stock.' };
      }

      const cost = reward.pointsCost;

      // 2. Concurrency-safe atomic stock decrement (requires stock >= 1 at update time)
      const stockUpdateResult = await tx.reward.updateMany({
        where: {
          id: rewardId,
          stock: { gte: 1 },
          isActive: true,
        },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });

      if (stockUpdateResult.count === 0) {
        throw {
          statusCode: 400,
          message: 'Reward is currently out of stock or unavailable.',
        };
      }

      // 3. Concurrency-safe atomic balance deduction (requires ecoBalance >= cost at update time)
      const balanceUpdateResult = await tx.user.updateMany({
        where: {
          id: userId,
          ecoBalance: { gte: cost },
        },
        data: {
          ecoBalance: {
            decrement: cost,
          },
        },
      });

      if (balanceUpdateResult.count === 0) {
        throw {
          statusCode: 400,
          message: `Insufficient Eco Coins. You need ${cost} points, but your balance is insufficient.`,
        };
      }

      // 4. Fetch updated balance and stock to return accurate state
      const [updatedUser, updatedReward] = await Promise.all([
        tx.user.findUnique({ where: { id: userId }, select: { ecoBalance: true } }),
        tx.reward.findUnique({ where: { id: rewardId }, select: { stock: true } }),
      ]);

      // 5. Create redemption record (status: REQUESTED)
      const redemption = await tx.rewardRedemption.create({
        data: {
          userId,
          rewardId,
          pointsSpent: cost,
          status: 'REQUESTED',
          notes: notes || '',
        },
      });

      // 6. Create EcoTransaction record (type: SPENT)
      const transaction = await tx.ecoTransaction.create({
        data: {
          userId,
          type: 'SPENT',
          amount: -cost,
          description: `Redeemed reward: ${reward.title}`,
          redemptionId: redemption.id,
        },
      });

      // 7. Create notification for the user
      await tx.notification.create({
        data: {
          userId,
          type: 'REWARD_UPDATE',
          title: 'Reward Requested',
          message: `You successfully redeemed ${reward.title} for ${cost} Eco Coins. Your request is being processed.`,
        },
      });

      return {
        redemption,
        transaction,
        remainingBalance: updatedUser.ecoBalance,
        remainingStock: updatedReward.stock,
      };
    });

    return res.status(201).json({
      status: 'success',
      message: 'Reward redemption submitted successfully.',
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    if (error.code === 'P2023') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid reward ID format.',
      });
    }
    next(error);
  }
}

/**
 * Get redemption history for the authenticated user.
 * Route: GET /api/rewards/redemptions
 */
async function getUserRedemptions(req, res, next) {
  try {
    const userId = req.user.id;

    const redemptions = await prisma.rewardRedemption.findMany({
      where: { userId },
      include: {
        reward: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            pointsCost: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      status: 'success',
      data: { redemptions },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRewards,
  redeemReward,
  getUserRedemptions,
};
