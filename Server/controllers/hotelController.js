import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';

const slugify = value => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function listHotels(req, res) {
  const filter = req.user?.role === 'admin' ? {} : { isActive: true };
  res.json(await Hotel.find(filter).sort({ name: 1 }));
}

export async function createHotel(req, res) {
  const { name, description, address, city, country } = req.body;
  if (!name || !description || !address || !city || !country) return res.status(400).json({ message: 'Name, description, address, city, and country are required.' });
  const hotel = await Hotel.create({ ...req.body, slug: slugify(name) });
  res.status(201).json(hotel);
}

export async function updateHotel(req, res) {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });
  const fields = ['name', 'description', 'address', 'city', 'country', 'photos', 'amenities', 'contactEmail', 'contactPhone', 'isActive'];
  for (const field of fields) if (req.body[field] !== undefined) hotel[field] = req.body[field];
  if (req.body.name) hotel.slug = slugify(req.body.name);
  await hotel.save();
  res.json(hotel);
}

export async function deleteHotel(req, res) {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });
  if (await Room.exists({ hotel: hotel._id })) return res.status(409).json({ message: 'Move or delete this hotel’s rooms before deleting the hotel.' });
  await hotel.deleteOne();
  res.json({ message: 'Hotel deleted.' });
}
