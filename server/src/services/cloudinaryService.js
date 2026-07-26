import cloudinary from '../config/cloudinary.js';

import fs from 'fs';
import path from 'path';

/**
 * Upload image buffer to Cloudinary
 */
export const uploadImage = async (fileBuffer, folder = 'nexabuy') => {
  // If Cloudinary is not configured, save the image locally to prevent crashes and allow testing
  if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your_api_key') {
    console.log('Cloudinary not configured. Saving image locally.');
    const uploadDir = path.join(process.cwd(), 'public/uploads', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filename = `local_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const filepath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filepath, fileBuffer);
    
    return {
      url: `http://localhost:${process.env.PORT || 5000}/uploads/${folder}/${filename}`,
      publicId: `local_${filename}`,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload multiple images
 */
export const uploadMultipleImages = async (files, folder = 'nexabuy/products') => {
  const uploadPromises = files.map((file) => uploadImage(file.buffer, folder));
  return Promise.all(uploadPromises);
};

/**
 * Delete image from Cloudinary
 */
export const deleteImage = async (publicId) => {
  if (!publicId) return;
  if (publicId.startsWith('local_')) {
    console.log(`Bypassing deletion for local image: ${publicId}`);
    return;
  }
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};

/**
 * Delete multiple images
 */
export const deleteMultipleImages = async (publicIds) => {
  const deletePromises = publicIds.filter(Boolean).map((id) => deleteImage(id));
  return Promise.all(deletePromises);
};
