const express = require('express');
const router = express.Router();
const { exportMedicinesCSV } = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/csv', protect, exportMedicinesCSV);

module.exports = router;
