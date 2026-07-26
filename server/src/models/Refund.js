import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  razorpayPaymentId: {
    type: String,
    required: [true, 'Razorpay payment ID is required'],
  },
  razorpayRefundId: {
    type: String,
    default: '',
  },
  amount: {
    type: Number,
    required: [true, 'Refund amount is required'],
    min: [0, 'Refund amount must be positive'],
  },
  reason: {
    type: String,
    required: [true, 'Refund reason is required'],
    enum: [
      'product_damaged',
      'wrong_product',
      'quality_issue',
      'not_as_described',
      'size_mismatch',
      'customer_request',
      'duplicate_order',
      'other',
    ],
  },
  description: {
    type: String,
    default: '',
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  status: {
    type: String,
    enum: ['initiated', 'processing', 'completed', 'failed'],
    default: 'initiated',
  },
  processedAt: {
    type: Date,
    default: null,
  },
  adminNote: {
    type: String,
    default: '',
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes
refundSchema.index({ order: 1 });
refundSchema.index({ user: 1 });
refundSchema.index({ status: 1 });
refundSchema.index({ createdAt: -1 });

const Refund = mongoose.model('Refund', refundSchema);
export default Refund;
