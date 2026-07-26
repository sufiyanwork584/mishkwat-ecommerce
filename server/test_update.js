import fetch from 'node-fetch';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const token = jwt.sign({ id: '6a3e3c0f65d648218159da84' }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Assuming any ID is fine since authorize('admin') might just check user role? Wait, we need an admin ID.

async function testUpdate() {
  console.log("Token:", token);
  // Actually, I can just update via Mongoose directly to see if the DB model accepts it.
}
