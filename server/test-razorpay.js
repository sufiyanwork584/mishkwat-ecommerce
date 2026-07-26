import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Testing Razorpay with Key ID:', process.env.RAZORPAY_KEY_ID);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

try {
  const order = await razorpay.orders.create({
    amount: 100, // 1 INR in paise
    currency: 'INR',
    receipt: 'test_receipt_123',
  });
  console.log('Success! Created order:', order);
} catch (error) {
  console.error('Error creating order:');
  console.error(error);
}
