import User from '../models/User.js';

export async function listUsers(req, res) {
  res.json(await User.find().select('name email phone role createdAt').sort({ createdAt: -1 }));
}

export async function updateUserRole(req, res) {
  const { role } = req.body;
  if (!['admin', 'customer'].includes(role)) return res.status(400).json({ message: 'Choose admin or customer as the role.' });
  if (req.params.id === req.user.id) return res.status(400).json({ message: 'You cannot change your own role.' });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select('name email phone role createdAt');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
}
