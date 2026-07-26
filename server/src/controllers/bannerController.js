import Banner from '../models/Banner.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { uploadImage, deleteImage } from '../services/cloudinaryService.js';

export const getBanners = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.query.admin === 'true') {
    filter = {};
  } else {
    const now = new Date();
    filter = {
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: null },
            { startDate: { $lte: now } }
          ]
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: now } }
          ]
        }
      ]
    };
  }
  const banners = await Banner.find(filter).sort({ displayOrder: 1 });
  res.json({ success: true, data: { banners } });
});

export const createBanner = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Banner image is required', 400);
  const image = await uploadImage(req.file.buffer, 'nexabuy/banners');
  
  const bannerData = { ...req.body };
  if (bannerData.isActive === 'true') bannerData.isActive = true;
  if (bannerData.isActive === 'false') bannerData.isActive = false;
  if (bannerData.displayOrder) bannerData.displayOrder = Number(bannerData.displayOrder);
  if (bannerData.startDate === '') bannerData.startDate = null;
  if (bannerData.endDate === '') bannerData.endDate = null;

  const banner = await Banner.create({ ...bannerData, image });
  res.status(201).json({ success: true, message: 'Banner created', data: { banner } });
});

export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw new AppError('Banner not found', 404);
  let image = banner.image;
  if (req.file) {
    await deleteImage(image.publicId);
    image = await uploadImage(req.file.buffer, 'nexabuy/banners');
  }

  const bannerData = { ...req.body };
  if (bannerData.isActive === 'true') bannerData.isActive = true;
  if (bannerData.isActive === 'false') bannerData.isActive = false;
  if (bannerData.displayOrder) bannerData.displayOrder = Number(bannerData.displayOrder);
  if (bannerData.startDate === '') bannerData.startDate = null;
  if (bannerData.endDate === '') bannerData.endDate = null;

  const updated = await Banner.findByIdAndUpdate(req.params.id, { ...bannerData, image }, { new: true });
  res.json({ success: true, message: 'Banner updated', data: { banner: updated } });
});

export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw new AppError('Banner not found', 404);
  await deleteImage(banner.image.publicId);
  await banner.deleteOne();
  res.json({ success: true, message: 'Banner deleted' });
});
