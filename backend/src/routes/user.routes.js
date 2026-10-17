const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { updateProfileSchema } = require('../validations/user.validation');

const router = express.Router();

// GET /api/users/profile — Authenticated: get profile & stats
router.get('/profile', authenticate, userController.getProfile);

// PATCH /api/users/profile — Authenticated: update safe profile fields
router.patch(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  userController.updateProfile
);

module.exports = router;
