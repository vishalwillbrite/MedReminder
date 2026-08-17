const express = require('express');
const router = express.Router();
const {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
} = require('../controllers/medicineController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { medicineValidationRules, validateMedicine } = require('../validators/medicineValidator');

router
  .route('/')
  .post(protect, upload.single('image'), medicineValidationRules, validateMedicine, createMedicine)
  .get(protect, getMedicines);

router
  .route('/:id')
  .get(protect, getMedicineById)
  .put(protect, upload.single('image'), updateMedicine)
  .delete(protect, deleteMedicine);

module.exports = router;
