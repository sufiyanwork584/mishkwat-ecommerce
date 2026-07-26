import User from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { uploadImage, deleteImage } from '../services/cloudinaryService.js';

export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) filter.$or = [{ name: { $regex: req.query.search, $options: 'i' } }, { email: { $regex: req.query.search, $options: 'i' } }];
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, data: { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, data: { user } });
});

export const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, message: 'User blocked', data: { user } });
});

export const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true });
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, message: 'User unblocked', data: { user } });
});

export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('addresses');
  res.json({ success: true, data: { addresses: user.addresses } });
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
  }
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, message: 'Address added', data: { addresses: user.addresses } });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new AppError('Address not found', 404);
  if (req.body.isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
  }
  Object.assign(address, req.body);
  await user.save();
  res.json({ success: true, message: 'Address updated', data: { addresses: user.addresses } });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new AppError('Address not found', 404);
  address.deleteOne();
  await user.save();
  res.json({ success: true, message: 'Address deleted', data: { addresses: user.addresses } });
});

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Image is required', 400);
  const user = await User.findById(req.user._id);
  if (user.avatar?.publicId) await deleteImage(user.avatar.publicId);
  const result = await uploadImage(req.file.buffer, 'nexabuy/avatars');
  user.avatar = result;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, message: 'Avatar updated', data: { avatar: user.avatar } });
});
