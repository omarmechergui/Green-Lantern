const express = require('express');
const wasteController = require('../controllers/waste.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createDeclarationSchema } = require('../validations/declaration.validation');
const { reviewDeclarationSchema } = require('../validations/reviewDeclaration.validation');

const router = express.Router();

// GET /api/waste-declarations — Authenticated: get declarations for the logged-in user
router.get(
  '/',
  authenticate,
  wasteController.getUserDeclarations
);

// POST /api/waste-declarations — Authenticated: create a new waste declaration
router.post(
  '/',
  authenticate,
  validate(createDeclarationSchema),
  wasteController.createDeclaration
);

// PATCH /api/waste-declarations/:id/review — Role-protected (ADMIN, PARTNER): approve or reject a declaration
router.patch(
  '/:id/review',
  authenticate,
  authorize('ADMIN', 'PARTNER'),
  validate(reviewDeclarationSchema),
  wasteController.reviewDeclaration
);

module.exports = router;

