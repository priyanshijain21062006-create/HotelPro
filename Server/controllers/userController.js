import User from '../models/User.js';

export async function listUsers(req, res) {
  res.json(await User.find().select('name email phone role createdAt').sort({ createdAt: -1 }));
}
