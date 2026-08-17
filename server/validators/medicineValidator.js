const { body, validationResult } = require('express-validator');

const medicineValidationRules = [
  body('name').trim().notEmpty().withMessage('Medicine name is required'),
  body('dosage').trim().notEmpty().withMessage('Dosage is required (e.g. 500mg, 1 tablet)'),
  body('medicineType')
    .isIn(['Tablet', 'Capsule', 'Syrup', 'Injection', 'Drops'])
    .withMessage('Invalid medicine type'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be an integer >= 1'),
  body('foodTiming')
    .isIn(['Before Food', 'After Food', 'With Food', 'No Restriction'])
    .withMessage('Invalid food timing option'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').isISO8601().withMessage('End date must be a valid date'),
];

const validateMedicine = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = errors.array().map((err) => ({ field: err.path, message: err.msg }));
  return res.status(400).json({
    message: extractedErrors[0].message,
    errors: extractedErrors,
  });
};

module.exports = {
  medicineValidationRules,
  validateMedicine,
};
