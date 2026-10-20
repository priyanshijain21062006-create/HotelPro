import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';

const photo = filename => `/images/${filename}`;
const hotelSeed = {
  name: 'HotelPro Riverside', slug: 'hotelpro-riverside',
  description: 'A relaxed city retreat with thoughtful rooms, warm service, and an easy connection to the riverfront.',
  address: '18 Riverside Walk', city: 'Mumbai', country: 'India',
  contactEmail: 'stay@hotelpro.example.test', contactPhone: '+91 22 5550 0100',
  amenities: ['Restaurant', 'River views', 'Wi-Fi', '24-hour desk'],
  photos: [photo('hero-hotel.jpg'), photo('hotel-lobby.jpg')], isActive: true
};
const roomSeed = [
  { roomNumber: '101', type: 'Double', description: 'A warm, light-filled room for two, with a quiet reading nook.', rent: 6200, count: 1, amenities: ['King bed', 'Rain shower', 'Breakfast'], photos: [photo('room-double.jpg')] },
  { roomNumber: '202', type: 'Deluxe', description: 'Soft textures and a private balcony overlooking the garden.', rent: 8900, count: 1, amenities: ['Balcony', 'Garden view', 'Lounge'], photos: [photo('room-deluxe.jpg')] },
  { roomNumber: '301', type: 'Suite', description: 'A spacious suite with a separate sitting room and deep soaking tub.', rent: 14500, count: 1, amenities: ['Suite', 'Soaking tub', 'King bed'], photos: [photo('room-suite.jpg')] },
  { roomNumber: '404', type: 'Single', description: 'A calm, considered hideaway for a restful night in the city.', rent: 4800, count: 1, amenities: ['Work desk', 'City view', 'Coffee'], photos: [photo('hotel-lobby.jpg')] }
];
const customerSeed = [
  { name: 'Mira Shah', email: 'mira.shah@example.test', phone: '+91 90000 10001' },
  { name: 'Arjun Mehta', email: 'arjun.mehta@example.test', phone: '+91 90000 10002' },
  { name: 'Nisha Patel', email: 'nisha.patel@example.test', phone: '+91 90000 10003' },
  { name: 'Dev Malhotra', email: 'dev.malhotra@example.test', phone: '+91 90000 10004' }
];

function dateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(12, 0, 0, 0);
  return date;
}

await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotelpro');
const indexes = await Room.collection.indexes().catch(() => []);
if (indexes.some(index => index.name === 'roomNumber_1')) await Room.collection.dropIndex('roomNumber_1');
await Room.collection.createIndex({ hotel: 1, roomNumber: 1 }, { unique: true });
const hotel = await Hotel.findOneAndUpdate({ slug: hotelSeed.slug }, { $setOnInsert: hotelSeed }, { upsert: true, new: true });
const rooms = new Map();
for (const data of roomSeed) {
  const room = await Room.findOneAndUpdate({ hotel: hotel._id, roomNumber: data.roomNumber }, { $set: { ...data, hotel: hotel._id } }, { upsert: true, new: true });
  rooms.set(data.roomNumber, room);
}

const customers = new Map();
for (const data of customerSeed) {
  let customer = await User.findOne({ email: data.email });
  if (!customer) customer = await User.create({ ...data, passwordHash: await bcrypt.hash(randomBytes(32).toString('hex'), 12), role: 'customer' });
  customers.set(data.email, customer);
}

const bookingSeed = [
  { email: 'mira.shah@example.test', room: '301', fromDaysAgo: 120, nights: 3, status: 'completed' },
  { email: 'arjun.mehta@example.test', room: '202', fromDaysAgo: 82, nights: 2, status: 'completed' },
  { email: 'nisha.patel@example.test', room: '101', fromDaysAgo: 47, nights: 4, status: 'completed' },
  { email: 'dev.malhotra@example.test', room: '404', fromDaysAgo: 19, nights: 1, status: 'cancelled' },
  { email: 'mira.shah@example.test', room: '202', fromDaysAgo: 8, nights: 2, status: 'completed' }
];
let bookingsCreated = 0;
for (const item of bookingSeed) {
  const room = rooms.get(item.room);
  const user = customers.get(item.email);
  const fromDate = dateDaysAgo(item.fromDaysAgo);
  const toDate = new Date(fromDate);
  toDate.setDate(toDate.getDate() + item.nights);
  const existing = await Booking.exists({ user: user._id, room: room._id, fromDate });
  if (!existing) {
    await Booking.create({ room: room._id, user: user._id, fromDate, toDate, totalDays: item.nights, totalAmount: room.rent * item.nights, guestName: user.name, status: item.status });
    bookingsCreated += 1;
  }
}

console.log(`Demo data ready: 1 hotel, ${roomSeed.length} rooms, ${customerSeed.length} sample guests, ${bookingsCreated} new historical bookings.`);
await mongoose.disconnect();
