import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Banner title is required'],
    trim: true,
  },
  subtitle: {
    type: String,
    default: '',
    trim: true,
  },
  image: {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  link: {
    type: String,
    default: '/',
  },
  buttonText: {
    type: String,
    default: '',
  },
  buttonUrl: {
    type: String,
    default: '',
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

bannerSchema.index({ isActive: 1, displayOrder: 1, startDate: 1, endDate: 1 });

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
