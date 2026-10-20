import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  totalDays: { type: Number, required: true, min: 1 },
  totalAmount: { type: Number, required: true, min: 0 },
  guestName: { type: String, required: true, trim: true },
  status: { type: String, enum: ['active', 'cancelled', 'completed'], default: 'active' }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
