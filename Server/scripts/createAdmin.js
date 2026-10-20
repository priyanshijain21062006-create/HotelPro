import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in .env first.');
if (ADMIN_PASSWORD.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters.');

await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotelpro');
const email = ADMIN_EMAIL.toLowerCase().trim();
const existing = await User.findOne({ email });
if (existing) {
  if (existing.role !== 'admin') throw new Error('This email already belongs to a non-admin user.');
  console.log(`Admin account already exists: ${email}`);
} else {
  await User.create({ name: ADMIN_NAME, email, phone: 'Not provided', passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12), role: 'admin' });
  console.log(`Admin account created: ${email}`);
}
await mongoose.disconnect();
