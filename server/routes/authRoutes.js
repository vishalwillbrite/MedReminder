const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  registerValidationRules,
  loginValidationRules,
  profileValidationRules,
  changePasswordValidationRules,
  validate,
} = require('../validators/authValidator');

router.post('/register', registerValidationRules, validate, registerUser);
router.post('/login', loginValidationRules, validate, loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, upload.single('avatar'), profileValidationRules, validate, updateUserProfile);
router.put('/change-password', protect, changePasswordValidationRules, validate, changePassword);

module.exports = router;
