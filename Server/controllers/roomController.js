import Room from '../models/Room.js';

export async function listRooms(req, res) {
  const rooms = await Room.find().sort({ createdAt: -1 });
  res.json(rooms);
}

export async function createRoom(req, res) {
  const { roomNumber, description, type, rent, count, photos, amenities } = req.body;
  if (!roomNumber || !description || !type || rent === undefined) return res.status(400).json({ message: 'Room number, description, type and price are required.' });
  const room = await Room.create({ roomNumber, description, type, rent: Number(rent), count: Number(count || 1), photos: photos || [], amenities: amenities || [] });
  res.status(201).json(room);
}

export async function deleteRoom(req, res) {
  await Room.findByIdAndDelete(req.params.id);
  res.json({ message: 'Room deleted.' });
}
