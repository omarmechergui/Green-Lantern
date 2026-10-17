const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/notifications — Authenticated: get user's notifications
router.get('/', authenticate, notificationController.getNotifications);

// PATCH /api/notifications/read-all — Authenticated: mark all as read
router.patch('/read-all', authenticate, notificationController.markAllAsRead);

// PATCH /api/notifications/:id/read — Authenticated: mark specific notification as read
router.patch('/:id/read', authenticate, notificationController.markAsRead);

module.exports = router;
