import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Deal title is required'],
    trim: true,
  },
  subtitle: {
    type: String,
    default: '',
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  offerText: {
    type: String,
    default: '',
    trim: true,
  },
  buttonText: {
    type: String,
    default: 'Unlock Deals',
    trim: true,
  },
  buttonLink: {
    type: String,
    default: '/',
    trim: true,
  },
  backgroundImage: {
    url: { type: String, required: [true, 'Background image URL is required'] },
    publicId: { type: String, required: [true, 'Background image public ID is required'] },
  },
  productImage: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

dealSchema.index({ isActive: 1, displayOrder: 1 });

const Deal = mongoose.model('Deal', dealSchema);
export default Deal;
