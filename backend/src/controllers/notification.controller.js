const prisma = require('../db');

/**
 * Get notifications for the authenticated user.
 * Route: GET /api/notifications
 */
async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.notification.count({
        where: { userId, readAt: null },
      }),
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark a notification as read.
 * Ensures the notification belongs to the authenticated user.
 * Route: PATCH /api/notifications/:id/read
 */
async function markAsRead(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found.',
      });
    }

    // Ownership check: User cannot mark another user's notification
    if (notification.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: You do not own this notification.',
      });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        readAt: new Date(),
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Notification marked as read.',
      data: { notification: updated },
    });
  } catch (error) {
    if (error.code === 'P2023') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid notification ID format.',
      });
    }
    next(error);
  }
}

/**
 * Mark all notifications as read for authenticated user.
 * Route: PATCH /api/notifications/read-all
 */
async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
