import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, trim: true, unique: true },
  description: { type: String, required: true, trim: true },
  photos: [{ type: String }],
  type: { type: String, enum: ['Single', 'Double', 'Suite', 'Deluxe'], required: true },
  rent: { type: Number, required: true, min: 0 },
  count: { type: Number, required: true, min: 1, default: 1 },
  amenities: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
