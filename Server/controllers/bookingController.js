import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';

export async function listBookings(req, res) {
  const filter = req.user.role === 'admin' ? {} : { user: req.user.id };
  const bookings = await Booking.find(filter).populate({ path: 'room', populate: { path: 'hotel', select: 'name address city country' } }).populate('user', 'name email phone').sort({ createdAt: -1 });
  res.json(bookings);
}

export async function createBooking(req, res) {
  const { roomId, fromDate, toDate, guestName } = req.body;
  const start = new Date(fromDate), end = new Date(toDate);
  if (!roomId || !guestName || Number.isNaN(+start) || Number.isNaN(+end) || end <= start) return res.status(400).json({ message: 'Choose a room, guest name, and valid check-in and check-out dates.' });
  const days = Math.ceil((end - start) / 86400000);
  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ message: 'Room not found.' });
  const hotel = await Hotel.findOne({ _id: room.hotel, isActive: true });
  if (!hotel) return res.status(409).json({ message: 'This hotel is not currently accepting bookings.' });
  const overlaps = await Booking.countDocuments({ room: roomId, status: 'active', fromDate: { $lt: end }, toDate: { $gt: start } });
  if (overlaps >= room.count) return res.status(409).json({ message: 'This room is unavailable for those dates.' });
  const booking = await Booking.create({ room: roomId, user: req.user.id, fromDate: start, toDate: end, totalDays: days, totalAmount: days * room.rent, guestName });
  res.status(201).json(await booking.populate({ path: 'room', populate: { path: 'hotel', select: 'name address city country' } }));
}

export async function cancelBooking(req, res) {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) return res.status(403).json({ message: 'You cannot cancel this booking.' });
  if (booking.status === 'cancelled') return res.status(400).json({ message: 'This booking is already cancelled.' });
  booking.status = 'cancelled';
  await booking.save();
  res.json({ message: 'Booking cancelled.', booking });
}
