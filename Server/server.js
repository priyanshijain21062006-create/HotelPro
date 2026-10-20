import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import api from './routes/api.js';

const app = express();
app.use(helmet());
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',').map(origin => origin.trim()).filter(Boolean);
// Support both hostnames commonly used to open the local Vite client.
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin is not allowed by CORS.'));
} }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'HotelPro API' }));
app.use('/api', api);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.code === 11000 ? 'That value is already in use.' : 'Something went wrong. Please try again.' });
});

const port = process.env.PORT || 5000;
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be set in the environment.');
await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotelpro');
app.listen(port, () => console.log(`HotelPro API listening on ${port}`));
