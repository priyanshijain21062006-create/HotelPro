import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  photos: [{ type: String }],
  amenities: [{ type: String }],
  contactEmail: { type: String, lowercase: true, trim: true },
  contactPhone: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Hotel', hotelSchema);
