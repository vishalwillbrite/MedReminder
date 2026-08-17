const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, gender } = req.body;
    const normalizedEmail = email ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      age: age ? Number(age) : null,
      gender: gender || '',
    });

    if (user) {
      const token = generateToken(res, user._id);

      await ActivityLog.create({
        user: user._id,
        action: 'USER_REGISTERED',
        details: `Account created for ${user.email}`,
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        avatar: user.avatar,
        role: user.role,
        token,
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email ? email.trim().toLowerCase() : '';

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(res, user._id);

      await ActivityLog.create({
        user: user._id,
        action: 'USER_LOGIN',
        details: `User logged in from ${req.ip || 'web'}`,
      });

      res.json({
        success: true,
        message: 'Login successful',
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        emergencyContact: user.emergencyContact,
        medicalConditions: user.medicalConditions,
        allergies: user.allergies,
        avatar: user.avatar,
        role: user.role,
        token,
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Successfully logged out' });
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        emergencyContact: user.emergencyContact,
        medicalConditions: user.medicalConditions,
        allergies: user.allergies,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.age = req.body.age !== undefined ? req.body.age : user.age;
      user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;

      if (req.body.emergencyContact) {
        user.emergencyContact = {
          name: req.body.emergencyContact.name ?? user.emergencyContact.name,
          phone: req.body.emergencyContact.phone ?? user.emergencyContact.phone,
          relation: req.body.emergencyContact.relation ?? user.emergencyContact.relation,
        };
      }

      if (Array.isArray(req.body.medicalConditions)) {
        user.medicalConditions = req.body.medicalConditions;
      }

      if (Array.isArray(req.body.allergies)) {
        user.allergies = req.body.allergies;
      }

      if (req.file) {
        user.avatar = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await user.save();

      await ActivityLog.create({
        user: user._id,
        action: 'PROFILE_UPDATED',
        details: 'User profile updated',
      });

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        gender: updatedUser.gender,
        emergencyContact: updatedUser.emergencyContact,
        medicalConditions: updatedUser.medicalConditions,
        allergies: updatedUser.allergies,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();

      await ActivityLog.create({
        user: user._id,
        action: 'PASSWORD_CHANGED',
        details: 'User changed password successfully',
      });

      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(400).json({ message: 'Incorrect current password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
};
