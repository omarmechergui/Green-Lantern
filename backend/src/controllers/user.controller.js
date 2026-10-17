const prisma = require('../db');

/**
 * Get profile of the authenticated user with real statistics.
 * Route: GET /api/users/profile
 */
async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        ecoBalance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found.',
      });
    }

    // Aggregate statistics
    const [declarations, redemptionsCount] = await Promise.all([
      prisma.wasteDeclaration.findMany({
        where: { citizenId: userId },
        include: {
          delivery: true,
          wasteCategory: { select: { name: true } },
        },
      }),
      prisma.rewardRedemption.count({
        where: { userId, status: { in: ['REQUESTED', 'COMPLETED'] } },
      }),
    ]);

    let totalVerifiedWeight = 0;
    let approvedCount = 0;
    declarations.forEach((d) => {
      if (d.status === 'APPROVED') {
        approvedCount++;
        totalVerifiedWeight += d.delivery?.acceptedWeight ?? d.estimatedWeight;
      }
    });

    return res.status(200).json({
      status: 'success',
      data: {
        user,
        stats: {
          totalDeclarations: declarations.length,
          approvedDeclarations: approvedCount,
          totalVerifiedWeightKg: Math.round(totalVerifiedWeight * 100) / 100,
          totalRedemptions: redemptionsCount,
          ecoBalance: user.ecoBalance,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update authenticated user profile fields.
 * Safe fields only: fullName, phone, avatar.
 * CANNOT change: role, ecoBalance, email, passwordHash, status.
 * Route: PATCH /api/users/profile
 */
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { fullName, phone, avatar } = req.body;

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields provided for update.',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        ecoBalance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully.',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
};
