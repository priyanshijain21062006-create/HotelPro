import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const publicUser = user => ({ id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role });
const tokenFor = user => jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

export async function signup(req, res) {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;
    if (!name || !email || !password || !confirmPassword || !phone) return res.status(400).json({ message: 'Complete all required fields.' });
    if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    if (await User.exists({ email: email.toLowerCase().trim() })) return res.status(409).json({ message: 'An account with this email already exists.' });
    // Public registration always creates a customer. Admins must be provisioned out of band.
    const user = await User.create({ name, email, phone, passwordHash: await bcrypt.hash(password, 12), role: 'customer' });
    res.status(201).json({ message: 'Account created successfully.', user: publicUser(user) });
  } catch (error) { res.status(400).json({ message: error.message || 'Could not create account.' }); }
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = email && await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return res.status(401).json({ message: 'Email or password is incorrect.' });
  res.json({ token: tokenFor(user), user: publicUser(user) });
}
