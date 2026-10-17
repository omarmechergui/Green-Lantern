const express = require('express');
const { getLeaderboard, getUserBadges } = require('../controllers/badgeLeaderboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/leaderboard — Public or Authenticated (if auth cookie provided, isCurrentUser marked)
router.get('/leaderboard', (req, res, next) => {
  // Optional auth
  authenticate(req, res, () => {
    next();
  });
}, getLeaderboard);

// GET /api/badges/my-badges — Authenticated
router.get('/badges/my-badges', authenticate, getUserBadges);

module.exports = router;
