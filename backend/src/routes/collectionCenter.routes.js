const express = require('express');
const wasteController = require('../controllers/waste.controller');

const router = express.Router();

// GET /api/collection-centers — Public: list active recycling centers
router.get('/', wasteController.getCollectionCenters);

module.exports = router;
