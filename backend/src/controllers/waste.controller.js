const prisma = require('../db');

/**
 * Get all active waste categories.
 * Route: GET /api/waste-categories
 */
async function getWasteCategories(req, res, next) {
  try {
    const categories = await prisma.wasteCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        pointsPerKg: true,
        icon: true,
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      status: 'success',
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all active collection/recycling centers with their accepted waste categories.
 * Route: GET /api/collection-centers
 */
async function getCollectionCenters(req, res, next) {
  try {
    const centers = await prisma.recyclingCenter.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        governorate: true,
        latitude: true,
        longitude: true,
        phone: true,
        email: true,
        acceptedCategories: {
          select: {
            wasteCategory: {
              select: {
                id: true,
                name: true,
                pointsPerKg: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Flatten the acceptedCategories join-table structure for a cleaner API response
    const formatted = centers.map((center) => {
      const { acceptedCategories, ...rest } = center;
      return {
        ...rest,
        acceptedCategories: acceptedCategories.map((ac) => ac.wasteCategory),
      };
    });

    return res.status(200).json({
      status: 'success',
      data: { centers: formatted },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new waste declaration for the authenticated user.
 * Route: POST /api/waste-declarations
 */
async function createDeclaration(req, res, next) {
  try {
    const citizenId = req.user.id;
    const {
      wasteCategoryId,
      deliveryMethod,
      estimatedWeight,
      description,
      pickupAddress,
      pickupLatitude,
      pickupLongitude,
      preferredPickupTime,
    } = req.body;

    // Verify the waste category exists and is active
    const category = await prisma.wasteCategory.findUnique({
      where: { id: wasteCategoryId },
      select: { id: true, isActive: true, name: true, pointsPerKg: true },
    });

    if (!category) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid waste category.',
      });
    }

    if (!category.isActive) {
      return res.status(400).json({
        status: 'error',
        message: 'This waste category is no longer active.',
      });
    }

    // Persist the declaration
    const declaration = await prisma.wasteDeclaration.create({
      data: {
        citizenId,
        wasteCategoryId,
        deliveryMethod,
        estimatedWeight,
        description: description || '',
        imageUrls: [], // No image upload infrastructure exists yet
        pickupAddress: deliveryMethod === 'PICKUP' ? pickupAddress : undefined,
        pickupLatitude: deliveryMethod === 'PICKUP' ? pickupLatitude : undefined,
        pickupLongitude: deliveryMethod === 'PICKUP' ? pickupLongitude : undefined,
        preferredPickupTime: deliveryMethod === 'PICKUP' && preferredPickupTime
          ? new Date(preferredPickupTime)
          : undefined,
        status: 'PENDING',
      },
      select: {
        id: true,
        citizenId: true,
        wasteCategoryId: true,
        deliveryMethod: true,
        estimatedWeight: true,
        description: true,
        imageUrls: true,
        status: true,
        createdAt: true,
        wasteCategory: {
          select: {
            name: true,
            pointsPerKg: true,
          },
        },
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Waste declaration submitted successfully.',
      data: { declaration },
    });
  } catch (error) {
    // Handle invalid ObjectId format from MongoDB
    if (error.code === 'P2023' || (error.message && error.message.includes('Malformed ObjectID'))) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid waste category ID format.',
      });
    }
    next(error);
  }
}

/**
 * Get declarations for the authenticated user (history) with optional status/type filter and pagination.
 * Route: GET /api/waste-declarations
 */
async function getUserDeclarations(req, res, next) {
  try {
    const userId = req.user.id;
    const { status, limit = 20, page = 1 } = req.query;

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const where = {
      citizenId: userId,
    };

    if (status && ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    const [declarations, total] = await Promise.all([
      prisma.wasteDeclaration.findMany({
        where,
        select: {
          id: true,
          wasteCategoryId: true,
          deliveryMethod: true,
          estimatedWeight: true,
          description: true,
          status: true,
          rejectionReason: true,
          reviewedAt: true,
          createdAt: true,
          wasteCategory: {
            select: {
              id: true,
              name: true,
              pointsPerKg: true,
              icon: true,
            },
          },
          delivery: {
            select: {
              acceptedWeight: true,
              status: true,
              transactions: {
                select: {
                  amount: true,
                  type: true,
                  createdAt: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parsedLimit,
      }),
      prisma.wasteDeclaration.count({ where }),
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        declarations,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(total / parsedLimit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Review/Approve a waste declaration (Role-protected: ADMIN, PARTNER).
 * Route: PATCH /api/waste-declarations/:id/review
 */
async function reviewDeclaration(req, res, next) {
  try {
    const reviewerId = req.user.id;
    const reviewerRole = req.user.role;
    const { id } = req.params;
    const { status, rejectionReason, acceptedWeight, centerId } = req.body;

    // Fetch existing declaration
    const declaration = await prisma.wasteDeclaration.findUnique({
      where: { id },
      include: {
        wasteCategory: true,
        delivery: {
          include: {
            center: true,
          },
        },
      },
    });

    if (!declaration) {
      return res.status(404).json({
        status: 'error',
        message: 'Waste declaration not found.',
      });
    }

    // Security check: Citizen cannot approve their own declaration
    if (declaration.citizenId === reviewerId) {
      return res.status(403).json({
        status: 'error',
        message: 'Security violation: You cannot review or approve your own declaration.',
      });
    }

    // Initial check (non-authoritative quick rejection; atomic guard inside transaction enforces concurrency safety)
    if (declaration.status !== 'PENDING') {
      return res.status(400).json({
        status: 'error',
        message: `Declaration is already ${declaration.status.toLowerCase()} and cannot be modified.`,
      });
    }

    // PARTNER Authorization Enforcement:
    // If reviewer is PARTNER, they can ONLY review declarations associated with a center they manage.
    if (reviewerRole === 'PARTNER') {
      // Determine center managing this delivery
      const existingCenterId = declaration.delivery?.centerId;
      const targetCenterId = existingCenterId || centerId;

      if (!targetCenterId) {
        return res.status(403).json({
          status: 'error',
          message: 'Partner authorization failed: A valid recycling center managed by you must be associated with this declaration.',
        });
      }

      // Verify that this partner is indeed the manager of targetCenterId
      const managedCenter = await prisma.recyclingCenter.findFirst({
        where: {
          id: targetCenterId,
          partnerId: reviewerId,
          isActive: true,
        },
        select: { id: true },
      });

      if (!managedCenter) {
        return res.status(403).json({
          status: 'error',
          message: 'Forbidden: You are not authorized to review declarations for this recycling center.',
        });
      }
    }

    if (status === 'REJECTED') {
      // Concurrency guard on REJECTED as well: only transition if currently PENDING
      const updateResult = await prisma.wasteDeclaration.updateMany({
        where: {
          id,
          status: 'PENDING',
        },
        data: {
          status: 'REJECTED',
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          rejectionReason: rejectionReason || 'Declined by reviewer',
        },
      });

      if (updateResult.count === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Declaration has already been reviewed or modified by another request.',
        });
      }

      const updated = await prisma.wasteDeclaration.findUnique({ where: { id } });

      // Create notification for citizen
      await prisma.notification.create({
        data: {
          userId: declaration.citizenId,
          type: 'DECLARATION_STATUS',
          title: 'Declaration Rejected',
          message: `Your declaration for ${declaration.wasteCategory.name} was rejected: ${rejectionReason || 'No reason provided'}.`,
        },
      }).catch(() => {}); // Non-blocking

      return res.status(200).json({
        status: 'success',
        message: 'Declaration has been rejected.',
        data: { declaration: updated },
      });
    }

    // Status is APPROVED:
    // Strictly require verified acceptedWeight. Never fall back to estimatedWeight.
    if (!acceptedWeight || typeof acceptedWeight !== 'number' || acceptedWeight <= 0 || !Number.isFinite(acceptedWeight)) {
      return res.status(400).json({
        status: 'error',
        message: 'Approval requires a verified, positive accepted weight. Estimated weight cannot be used.',
      });
    }

    const verifiedWeight = acceptedWeight;
    const pointsAwarded = Math.round(verifiedWeight * declaration.wasteCategory.pointsPerKg);

    // MongoDB Atlas interactive transaction for atomic state transition, delivery, transaction, and balance increment
    const result = await prisma.$transaction(async (tx) => {
      // 1. Concurrency-safe atomic guard: transition status from PENDING to APPROVED
      const transitionResult = await tx.wasteDeclaration.updateMany({
        where: {
          id,
          status: 'PENDING',
        },
        data: {
          status: 'APPROVED',
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
      });

      // If count is 0, another concurrent request already updated this declaration!
      if (transitionResult.count === 0) {
        throw {
          statusCode: 409,
          message: 'Conflict: This declaration was already reviewed or updated by another process.',
        };
      }

      // Fetch the updated declaration within the transaction
      const updatedDecl = await tx.wasteDeclaration.findUnique({ where: { id } });

      // 2. Create or update WasteDelivery record
      let delivery = declaration.delivery;
      const deliveryCenterId = delivery?.centerId || centerId || undefined;

      if (!delivery) {
        delivery = await tx.wasteDelivery.create({
          data: {
            declarationId: id,
            centerId: deliveryCenterId,
            status: 'VERIFIED',
            acceptedWeight: verifiedWeight,
            verifiedById: reviewerId,
            verifiedAt: new Date(),
          },
        });
      } else {
        delivery = await tx.wasteDelivery.update({
          where: { id: delivery.id },
          data: {
            centerId: deliveryCenterId,
            status: 'VERIFIED',
            acceptedWeight: verifiedWeight,
            verifiedById: reviewerId,
            verifiedAt: new Date(),
          },
        });
      }

      // 3. Create EcoTransaction record
      const transaction = await tx.ecoTransaction.create({
        data: {
          userId: declaration.citizenId,
          type: 'EARNED',
          amount: pointsAwarded,
          description: `Eco Coins earned for recycling ${verifiedWeight} kg of ${declaration.wasteCategory.name}`,
          deliveryId: delivery.id,
        },
      });

      // 4. Update Citizen balance atomically
      const updatedCitizen = await tx.user.update({
        where: { id: declaration.citizenId },
        data: {
          ecoBalance: {
            increment: pointsAwarded,
          },
        },
        select: { ecoBalance: true },
      });

      // 5. Create notification for the citizen
      await tx.notification.create({
        data: {
          userId: declaration.citizenId,
          type: 'POINTS_AWARDED',
          title: 'Eco Coins Awarded!',
          message: `Your recycling deposit of ${verifiedWeight} kg of ${declaration.wasteCategory.name} was approved! You earned ${pointsAwarded} Eco Coins.`,
        },
      });

      return {
        declaration: updatedDecl,
        delivery,
        transaction,
        newBalance: updatedCitizen.ecoBalance,
      };
    });

    return res.status(200).json({
      status: 'success',
      message: `Declaration approved successfully. ${pointsAwarded} Eco Coins awarded.`,
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
        message: 'Invalid declaration ID format.',
      });
    }
    next(error);
  }
}

module.exports = {
  getWasteCategories,
  getCollectionCenters,
  createDeclaration,
  getUserDeclarations,
  reviewDeclaration,
};

