import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  roomNumber: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  photos: [{ type: String }],
  type: { type: String, enum: ['Single', 'Double', 'Suite', 'Deluxe'], required: true },
  rent: { type: Number, required: true, min: 0 },
  count: { type: Number, required: true, min: 1, default: 1 },
  amenities: [{ type: String }]
}, { timestamps: true });

roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });

export default mongoose.model('Room', roomSchema);
