const prisma = require('../db');

/**
 * Get eco rankings / leaderboard based on real user data.
 * Excludes sensitive fields (no emails, no phone numbers, no passwords).
 * Route: GET /api/leaderboard
 */
async function getLeaderboard(req, res, next) {
  try {
    const { limit = 20 } = req.query;
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);

    // Fetch active users ordered by ecoBalance descending
    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        fullName: true,
        avatar: true,
        ecoBalance: true,
      },
      orderBy: [
        { ecoBalance: 'desc' },
        { createdAt: 'asc' }, // Consistent tie-breaker
      ],
      take: parsedLimit,
    });

    const currentUserId = req.user?.id;

    const leaderboard = users.map((u, index) => ({
      rank: index + 1,
      id: u.id,
      name: u.fullName,
      avatar: u.avatar,
      points: u.ecoBalance,
      isCurrentUser: currentUserId === u.id,
    }));

    return res.status(200).json({
      status: 'success',
      data: { leaderboard },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Calculate user's badges from real activity and transactions.
 * Route: GET /api/badges/my-badges
 */
async function getUserBadges(req, res, next) {
  try {
    const userId = req.user.id;

    // Fetch user with ecoBalance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, ecoBalance: true },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found.',
      });
    }

    // Fetch approved declarations with categories
    const approvedDeclarations = await prisma.wasteDeclaration.findMany({
      where: {
        citizenId: userId,
        status: 'APPROVED',
      },
      include: {
        wasteCategory: true,
        delivery: true,
      },
    });

    // Calculate metrics
    let totalVerifiedKg = 0;
    const categoryWeights = {};

    approvedDeclarations.forEach((d) => {
      const weight = d.delivery?.acceptedWeight ?? d.estimatedWeight;
      totalVerifiedKg += weight;
      const cat = d.wasteCategory?.name?.toLowerCase() || 'other';
      categoryWeights[cat] = (categoryWeights[cat] || 0) + weight;
    });

    // Badge definition rules
    const badgeDefinitions = [
      {
        id: 'first-step',
        badgeName: 'Green Starter',
        description: 'Completed your first approved waste recycling deposit.',
        icon: 'leaf',
        earned: approvedDeclarations.length >= 1,
        progress: Math.min(approvedDeclarations.length, 1),
        target: 1,
        category: 'milestone',
      },
      {
        id: 'food-saver',
        badgeName: 'Food Saver',
        description: 'Recycled 10 kg of organic/food waste.',
        icon: 'utensils',
        earned: (categoryWeights['food'] || categoryWeights['organic'] || 0) >= 10,
        progress: Math.round((categoryWeights['food'] || categoryWeights['organic'] || 0) * 10) / 10,
        target: 10,
        category: 'food',
      },
      {
        id: 'plastic-hero',
        badgeName: 'Plastic Hero',
        description: 'Recycled 10 kg of plastic waste.',
        icon: 'bottle',
        earned: (categoryWeights['plastic'] || 0) >= 10,
        progress: Math.round((categoryWeights['plastic'] || 0) * 10) / 10,
        target: 10,
        category: 'plastic',
      },
      {
        id: 'clothes-donor',
        badgeName: 'Clothes Donor',
        description: 'Donated 5 kg of textiles or clothing.',
        icon: 'tshirt',
        earned: (categoryWeights['clothes'] || categoryWeights['textiles'] || 0) >= 5,
        progress: Math.round((categoryWeights['clothes'] || categoryWeights['textiles'] || 0) * 10) / 10,
        target: 5,
        category: 'clothes',
      },
      {
        id: 'eco-champion',
        badgeName: 'Eco Champion',
        description: 'Accumulated over 1,000 Eco Coins.',
        icon: 'trophy',
        earned: user.ecoBalance >= 1000,
        progress: Math.min(user.ecoBalance, 1000),
        target: 1000,
        category: 'coins',
      },
    ];

    // Compute tier/rank
    const levels = [
      { name: 'Green Starter', min: 0, max: 500, color: '#86efac' },
      { name: 'Eco Explorer', min: 500, max: 1500, color: '#4ade80' },
      { name: 'Planet Protector', min: 1500, max: 3500, color: '#22c55e' },
      { name: 'Nature Legend', min: 3500, max: 10000, color: '#16a34a' },
    ];

    const currentLevel =
      levels.find((l) => user.ecoBalance >= l.min && user.ecoBalance < l.max) ||
      levels[levels.length - 1];

    const nextLevel = levels.find((l) => l.min > currentLevel.min) || null;

    return res.status(200).json({
      status: 'success',
      data: {
        ecoBalance: user.ecoBalance,
        totalVerifiedKg: Math.round(totalVerifiedKg * 10) / 10,
        approvedDeposits: approvedDeclarations.length,
        currentLevel,
        nextLevel,
        badges: badgeDefinitions,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLeaderboard,
  getUserBadges,
};
