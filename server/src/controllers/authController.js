import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { generateAccessToken, generateRefreshToken, setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/helpers.js';
import { sendEmail } from '../services/emailService.js';
import { welcomeEmailTemplate, passwordResetTemplate } from '../utils/emailTemplates.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/** POST /api/v1/auth/register */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError('Email already registered', 400);

  const user = await User.create({ name, email, password, phone });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, refreshToken);

  // Send welcome email (non-blocking)
  sendEmail({
    to: user.email,
    subject: 'Welcome to Mishkwat! 🎉',
    html: welcomeEmailTemplate(user.name),
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      accessToken,
    },
  });
});

/** POST /api/v1/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Invalid email or password', 401);

  if (user.isBlocked) throw new AppError('Your account has been blocked. Contact support.', 403);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, refreshToken);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone },
      accessToken,
    },
  });
});

/** POST /api/v1/auth/google */
export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) throw new AppError('Google credential is required', 400);

  // Verify the Google ID token
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new AppError('Invalid Google credential', 401);
  }

  const { sub: googleId, email, name, picture } = payload;

  // Find existing user by googleId or email
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    // Link Google account if user exists with email but no googleId
    if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = user.authProvider === 'local' ? 'local' : 'google';
    }
    // Update avatar if user doesn't have one
    if (picture && (!user.avatar || !user.avatar.url)) {
      user.avatar = { url: picture, publicId: '' };
    }
    if (user.isBlocked) throw new AppError('Your account has been blocked. Contact support.', 403);
  } else {
    // Create new user with Google account
    user = await User.create({
      name,
      email,
      googleId,
      authProvider: 'google',
      avatar: { url: picture || '', publicId: '' },
    });

    // Send welcome email (non-blocking)
    sendEmail({
      to: user.email,
      subject: 'Welcome to Mishkwat! 🎉',
      html: welcomeEmailTemplate(user.name),
    });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, refreshToken);

  res.json({
    success: true,
    message: 'Google login successful',
    data: {
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone },
      accessToken,
    },
  });
});

/** POST /api/v1/auth/logout */
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    await User.findOneAndUpdate({ refreshToken }, { refreshToken: '' });
  }

  clearRefreshTokenCookie(res);

  res.json({ success: true, message: 'Logged out successfully' });
});

/** POST /api/v1/auth/refresh-token */
export const refreshTokenHandler = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw new AppError('No refresh token provided', 401);

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, newRefreshToken);

  res.json({
    success: true,
    data: { accessToken: newAccessToken },
  });
});

/** POST /api/v1/auth/forgot-password */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError('No user found with that email', 404);

  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // Always print reset URL in console for development/debugging purposes
  console.log('\n🔑 ==========================================');
  console.log('PASSWORD RESET URL REQUESTED:');
  console.log(resetUrl);
  console.log('=============================================\n');

  await sendEmail({
    to: user.email,
    subject: 'Mishkwat - Password Reset Request',
    html: passwordResetTemplate(resetUrl),
  });

  res.json({
    success: true,
    message: 'Password reset email sent',
    resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
  });
});

/** POST /api/v1/auth/reset-password/:token */
export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw new AppError('Invalid or expired reset token', 400);

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful' });
});

/** GET /api/v1/auth/me */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: { user } });
});

/** PUT /api/v1/auth/update-profile */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, message: 'Profile updated', data: { user } });
});

/** PUT /api/v1/auth/change-password */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Google-only users cannot change password (they don't have one)
  if (user.authProvider === 'google' && !user.password) {
    throw new AppError('Cannot change password for Google-authenticated accounts. Use Google to sign in.', 400);
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new AppError('Current password is incorrect', 400);

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
});
