const { body, validationResult } = require('express-validator');

const registerValidationRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const loginValidationRules = [
  body('email').isEmail().withMessage('Please include a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

const profileValidationRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('age').optional({ nullable: true }).isNumeric().withMessage('Age must be a number'),
  body('gender').optional().isIn(['Male', 'Female', 'Other', 'Prefer not to say', '']).withMessage('Invalid gender option'),
];

const changePasswordValidationRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
];

const validate = (req, res, next) => {
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
  registerValidationRules,
  loginValidationRules,
  profileValidationRules,
  changePasswordValidationRules,
  validate,
};
