import Newsletter from '../models/Newsletter.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { sendEmail } from '../services/emailService.js';
import { newsletterWelcomeTemplate } from '../utils/emailTemplates.js';

export const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const existing = await Newsletter.findOne({ email });
  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true;
      await existing.save();
      return res.json({ success: true, message: 'Resubscribed successfully' });
    }
    throw new AppError('Email already subscribed', 400);
  }
  await Newsletter.create({ email });
  sendEmail({ to: email, subject: 'Welcome to Mishkwat Newsletter!', html: newsletterWelcomeTemplate(email) });
  res.status(201).json({ success: true, message: 'Subscribed successfully' });
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await Newsletter.findOneAndUpdate({ email }, { isActive: false });
  res.json({ success: true, message: 'Unsubscribed successfully' });
});
