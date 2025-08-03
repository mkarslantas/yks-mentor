const User = require('../models/User');
const { generateTokens, verifyToken } = require('../config/auth');
const { comparePassword, sanitizeUser } = require('../utils/helpers');
const { SUCCESS_MESSAGES, ERROR_MESSAGES, ERROR_CODES } = require('../utils/constants');
const { asyncHandler } = require('../middlewares/error.middleware');
const database = require('../config/database');

const register = asyncHandler(async (req, res) => {
  const { email, password, role, name, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: {
        code: ERROR_CODES.DUPLICATE_ENTRY,
        message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
      }
    });
  }

  // Create user
  const user = await User.create({
    email,
    password,
    role,
    name,
    phone
  });

  // Create student profile if user is a student
  if (role === 'student') {
    await database.run(
      'INSERT INTO student_profiles (user_id) VALUES (?)',
      [user.id]
    );
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  // Store refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
  
  await database.run(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [user.id, refreshToken, expiresAt.toISOString()]
  );

  res.status(201).json({
    success: true,
    message: SUCCESS_MESSAGES.USER_CREATED,
    data: {
      user,
      accessToken,
      refreshToken
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: ERROR_CODES.AUTHENTICATION_ERROR,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS
      }
    });
  }

  // Check password
  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      error: {
        code: ERROR_CODES.AUTHENTICATION_ERROR,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS
      }
    });
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  // Clean up old refresh tokens
  await database.run(
    'DELETE FROM refresh_tokens WHERE user_id = ? AND expires_at < ?',
    [user.id, new Date().toISOString()]
  );

  // Store new refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  await database.run(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [user.id, refreshToken, expiresAt.toISOString()]
  );

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    }
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  // Verify refresh token
  const storedToken = await database.get(
    'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > ?',
    [token, new Date().toISOString()]
  );

  if (!storedToken) {
    return res.status(401).json({
      success: false,
      error: {
        code: ERROR_CODES.AUTHENTICATION_ERROR,
        message: ERROR_MESSAGES.INVALID_TOKEN
      }
    });
  }

  const user = req.user; // Set by refreshTokenMiddleware

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role);

  // Update refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await database.run(
    'UPDATE refresh_tokens SET token = ?, expires_at = ? WHERE id = ?',
    [newRefreshToken, expiresAt.toISOString(), storedToken.id]
  );

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken: newRefreshToken
    }
  });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Remove refresh token from database
    await database.run(
      'DELETE FROM refresh_tokens WHERE token = ?',
      [refreshToken]
    );
  }

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  let profile = sanitizeUser(user);

  // If user is a student, include student profile data
  if (user.role === 'student') {
    const studentProfile = await database.get(`
      SELECT 
        sp.*,
        u.name as coach_name
      FROM student_profiles sp
      LEFT JOIN users u ON sp.coach_id = u.id
      WHERE sp.user_id = ?
    `, [user.id]);

    if (studentProfile) {
      profile.studentProfile = studentProfile;
    }
  }

  res.json({
    success: true,
    data: { user: profile }
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, email, phone, studentProfile } = req.body;
  
  console.log('👤 Profile update request:', { 
    userId, 
    name, 
    email, 
    phone, 
    studentProfile,
    body: req.body 
  });

  // Update user data
  const updateData = {};
  if (name) updateData.name = name;
  if (email) {
    // Check if email is already taken by another user
    const existingUser = await User.findByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      return res.status(409).json({
        success: false,
        error: {
          code: ERROR_CODES.DUPLICATE_ENTRY,
          message: 'Bu e-posta adresi başka bir hesap tarafından kullanılıyor'
        }
      });
    }
    updateData.email = email;
  }
  if (phone) {
    // Clean phone number - remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    updateData.phone = cleanPhone;
  }

  if (Object.keys(updateData).length > 0) {
    await User.update(userId, updateData);
  }

  // Update student profile if provided and user is a student
  if (req.user.role === 'student' && studentProfile) {
    const {
      target_field,
      target_university,
      target_department,
      exam_date,
      grade_level,
      school_name
    } = studentProfile;

    const profileFields = [];
    const profileValues = [];

    if (target_field) {
      profileFields.push('target_field = ?');
      profileValues.push(target_field);
    }
    if (target_university) {
      profileFields.push('target_university = ?');
      profileValues.push(target_university);
    }
    if (target_department) {
      profileFields.push('target_department = ?');
      profileValues.push(target_department);
    }
    if (exam_date) {
      profileFields.push('exam_date = ?');
      profileValues.push(exam_date);
    }
    if (grade_level) {
      profileFields.push('grade_level = ?');
      profileValues.push(grade_level);
    }
    if (school_name) {
      profileFields.push('school_name = ?');
      profileValues.push(school_name);
    }

    if (profileFields.length > 0) {
      profileValues.push(userId);
      await database.run(
        `UPDATE student_profiles SET ${profileFields.join(', ')} WHERE user_id = ?`,
        profileValues
      );
    }
  }

  // Return updated profile
  const updatedUser = await User.findById(userId);
  let profile = sanitizeUser(updatedUser);

  if (updatedUser.role === 'student') {
    const studentProfile = await database.get(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    if (studentProfile) {
      profile.studentProfile = studentProfile;
    }
  }

  res.json({
    success: true,
    message: 'Profil başarıyla güncellendi',
    data: { user: profile }
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Verify current password
  const user = await User.findById(userId);
  const isValidPassword = await comparePassword(currentPassword, user.password);

  if (!isValidPassword) {
    return res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Mevcut şifre yanlış'
      }
    });
  }

  // Update password
  await User.updatePassword(userId, newPassword);

  // Invalidate all refresh tokens for security
  await database.run(
    'DELETE FROM refresh_tokens WHERE user_id = ?',
    [userId]
  );

  res.json({
    success: true,
    message: 'Şifre başarıyla değiştirildi'
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword
};