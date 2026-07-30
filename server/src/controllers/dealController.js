import Deal from '../models/Deal.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { uploadImage, deleteImage } from '../services/cloudinaryService.js';

export const getDeals = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.query.admin !== 'true') {
    const now = new Date();
    filter = {
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    };
  }
  const deals = await Deal.find(filter).sort({ displayOrder: 1 });
  res.json({ success: true, data: { deals } });
});

export const createDeal = asyncHandler(async (req, res) => {
  let backgroundImage = { url: '', publicId: '' };
  let productImage = { url: '', publicId: '' };

  if (req.files) {
    if (req.files.backgroundImage && req.files.backgroundImage[0]) {
      backgroundImage = await uploadImage(req.files.backgroundImage[0].buffer, 'nexabuy/deals');
    }
    if (req.files.productImage && req.files.productImage[0]) {
      productImage = await uploadImage(req.files.productImage[0].buffer, 'nexabuy/deals');
    }
  }

  const dealData = { ...req.body };
  if (dealData.isActive === 'true') dealData.isActive = true;
  if (dealData.isActive === 'false') dealData.isActive = false;
  if (dealData.displayOrder) dealData.displayOrder = Number(dealData.displayOrder);
  if (dealData.startDate === '') dealData.startDate = null;
  if (dealData.endDate === '') dealData.endDate = null;

  const deal = await Deal.create({
    ...dealData,
    backgroundImage,
    productImage,
  });

  res.status(201).json({ success: true, message: 'Deal created successfully', data: { deal } });
});

export const updateDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) throw new AppError('Deal not found', 404);

  let backgroundImage = deal.backgroundImage;
  let productImage = deal.productImage || { url: '', publicId: '' };

  if (req.files) {
    if (req.files.backgroundImage && req.files.backgroundImage[0]) {
      if (backgroundImage && backgroundImage.publicId) {
        await deleteImage(backgroundImage.publicId);
      }
      backgroundImage = await uploadImage(req.files.backgroundImage[0].buffer, 'nexabuy/deals');
    }
    if (req.files.productImage && req.files.productImage[0]) {
      if (productImage && productImage.publicId) {
        await deleteImage(productImage.publicId);
      }
      productImage = await uploadImage(req.files.productImage[0].buffer, 'nexabuy/deals');
    }
  }

  const dealData = { ...req.body };
  if (dealData.isActive === 'true') dealData.isActive = true;
  if (dealData.isActive === 'false') dealData.isActive = false;
  if (dealData.displayOrder) dealData.displayOrder = Number(dealData.displayOrder);
  if (dealData.startDate === '') dealData.startDate = null;
  if (dealData.endDate === '') dealData.endDate = null;

  const updated = await Deal.findByIdAndUpdate(
    req.params.id,
    { ...dealData, backgroundImage, productImage },
    { new: true }
  );

  res.json({ success: true, message: 'Deal updated successfully', data: { deal: updated } });
});

export const deleteDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) throw new AppError('Deal not found', 404);

  if (deal.backgroundImage && deal.backgroundImage.publicId) {
    await deleteImage(deal.backgroundImage.publicId);
  }
  if (deal.productImage && deal.productImage.publicId) {
    await deleteImage(deal.productImage.publicId);
  }

  await deal.deleteOne();
  res.json({ success: true, message: 'Deal deleted successfully' });
});
