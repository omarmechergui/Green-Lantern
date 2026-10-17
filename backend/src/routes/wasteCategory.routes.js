const express = require('express');
const wasteController = require('../controllers/waste.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createDeclarationSchema } = require('../validations/declaration.validation');

const router = express.Router();

// GET /api/waste-categories — Public: list active waste categories
router.get('/', wasteController.getWasteCategories);

module.exports = router;
