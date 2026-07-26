import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { uploadImage, deleteImage } from '../services/cloudinaryService.js';

/**
 * Upload single image to Cloudinary
 * POST /api/v1/upload
 */
export const uploadSingleImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No image file provided', 400);
  }

  // Determine target folder based on request query or body
  const folder = req.query.folder || 'nexabuy/uploads';
  const result = await uploadImage(req.file.buffer, folder);

  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      url: result.url,
      publicId: result.publicId,
    },
  });
});

/**
 * Delete image from Cloudinary
 * DELETE /api/v1/upload/:publicId
 */
export const deleteCloudinaryImage = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  if (!publicId) {
    throw new AppError('Public ID is required', 400);
  }

  await deleteImage(publicId);

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully',
  });
});
