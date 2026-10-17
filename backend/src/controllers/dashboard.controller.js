const prisma = require('../db');

/**
 * Get dashboard stats for the currently authenticated user.
 * Route: GET /api/dashboard/stats
 */
async function getDashboardStats(req, res, next) {
  try {
    const userId = req.user.id;

    // Fetch user with current eco balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        ecoBalance: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found.',
      });
    }

    // Fetch declarations for the user
    const declarations = await prisma.wasteDeclaration.findMany({
      where: { citizenId: userId },
      include: {
        wasteCategory: {
          select: {
            id: true,
            name: true,
            pointsPerKg: true,
          },
        },
        delivery: {
          select: {
            acceptedWeight: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Counts by declaration status
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let totalVerifiedWeight = 0;
    let totalEstimatedWeight = 0;

    // Category breakdown for verified/approved waste
    const categoryTotals = {};

    declarations.forEach((decl) => {
      totalEstimatedWeight += decl.estimatedWeight;
      if (decl.status === 'PENDING') {
        pendingCount++;
      } else if (decl.status === 'APPROVED') {
        approvedCount++;
        // Use verified acceptedWeight from delivery if available, else estimatedWeight
        const verifiedWeight = decl.delivery?.acceptedWeight ?? decl.estimatedWeight;
        totalVerifiedWeight += verifiedWeight;

        const catName = decl.wasteCategory?.name || 'Other';
        categoryTotals[catName] = (categoryTotals[catName] || 0) + verifiedWeight;
      } else if (decl.status === 'REJECTED') {
        rejectedCount++;
      }
    });

    // Total Eco Coins redeemed/spent
    const redemptionAgg = await prisma.rewardRedemption.aggregate({
      where: {
        userId,
        status: { in: ['REQUESTED', 'COMPLETED'] },
      },
      _sum: {
        pointsSpent: true,
      },
      _count: {
        id: true,
      },
    });

    const totalRedeemedPoints = redemptionAgg._sum.pointsSpent || 0;
    const totalRedemptionsCount = redemptionAgg._count.id || 0;

    // Approximation: 1 kg of verified recycled waste offsets approx ~0.82 kg CO2 eq.
    const co2OffsetKg = Math.round(totalVerifiedWeight * 0.82 * 10) / 10;

    // Recent 5 declarations for dashboard activity preview
    const recentActivity = declarations.slice(0, 5).map((d) => ({
      id: d.id,
      category: d.wasteCategory?.name || 'General Waste',
      estimatedWeight: d.estimatedWeight,
      status: d.status,
      deliveryMethod: d.deliveryMethod,
      createdAt: d.createdAt,
    }));

    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          ecoBalance: user.ecoBalance,
        },
        kpis: {
          ecoBalance: user.ecoBalance,
          totalVerifiedWeightKg: Math.round(totalVerifiedWeight * 100) / 100,
          totalDeclarations: declarations.length,
          approvedCount,
          pendingCount,
          rejectedCount,
          co2OffsetKg,
          totalRedeemedPoints,
          totalRedemptionsCount,
        },
        categoryTotals,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
};
