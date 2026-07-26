import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
  images: [{
    url: String,
    publicId: String,
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Compound index: one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
reviewSchema.index({ product: 1, status: 1 });

// Static method to calculate average rating for a product
reviewSchema.statics.calculateAvgRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
        totalRatings: { $sum: '$rating' },
      },
    },
  ]);

  const Product = mongoose.model('Product');
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      avgRating: Math.round(result[0].avgRating * 10) / 10,
      numReviews: result[0].numReviews,
      totalRatings: result[0].totalRatings,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      avgRating: 0,
      numReviews: 0,
      totalRatings: 0,
    });
  }
};

// Recalculate after save
reviewSchema.post('save', function () {
  this.constructor.calculateAvgRating(this.product);
});

// Recalculate after remove
reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    doc.constructor.calculateAvgRating(doc.product);
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
