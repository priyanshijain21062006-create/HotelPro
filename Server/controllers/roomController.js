import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';

export async function listRooms(req, res) {
  const rooms = await Room.find().populate({ path: 'hotel', select: 'name address city country isActive photos' }).sort({ createdAt: -1 });
  res.json(req.user?.role === 'admin' ? rooms : rooms.filter(room => room.hotel?.isActive));
}

export async function createRoom(req, res) {
  const { hotelId, roomNumber, description, type, rent, count, photos, amenities } = req.body;
  if (!hotelId || !roomNumber || !description || !type || rent === undefined) return res.status(400).json({ message: 'Hotel, room number, description, type and price are required.' });
  const hotel = await Hotel.findOne({ _id: hotelId, isActive: true });
  if (!hotel) return res.status(400).json({ message: 'Choose an active hotel.' });
  const room = await Room.create({ hotel: hotel._id, roomNumber, description, type, rent: Number(rent), count: Number(count || 1), photos: photos || [], amenities: amenities || [] });
  res.status(201).json(await room.populate('hotel', 'name address city country isActive photos'));
}

export async function deleteRoom(req, res) {
  if (await Booking.exists({ room: req.params.id })) return res.status(409).json({ message: 'This room has booking history and cannot be deleted.' });
  await Room.findByIdAndDelete(req.params.id);
  res.json({ message: 'Room deleted.' });
}
