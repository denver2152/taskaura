import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import router from './routes/index.js';
import { connectDB } from './config/db.js';

const app = express();
const origins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || origins.includes(origin.replace(/\/$/, ''))) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: false,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many verification requests. Try again later.' },
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many sign-in attempts. Try again later.' },
});
const inviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many invitation requests. Try again later.' },
});

app.use('/api/auth/login', loginLimiter);
app.use([
  '/api/auth/register',
  '/api/auth/verify-email',
  '/api/auth/resend-otp',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
], otpLimiter);
app.use('/api/team/invitations', inviteLimiter);

app.use('/api', async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'taskaura-api' }));
app.use('/api', router);
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((error, _req, res, _next) => {
  if (error.name === 'ZodError') {
    return res.status(400).json({ message: error.issues?.[0]?.message || 'Invalid request' });
  }
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Attachments must be 10 MB or smaller' });
  }
  if (error.name === 'MulterError') {
    return res.status(400).json({ message: 'The attachment upload could not be processed' });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'That value is already in use' });
  }
  if (error.name === 'CastError' || error.name === 'ValidationError') {
    return res.status(400).json({ message: 'Invalid request data' });
  }
  if (error.message === 'Origin is not allowed by CORS') {
    return res.status(403).json({ message: 'This origin is not allowed' });
  }

  // Log only stable error metadata; database and provider messages may contain secrets.
  console.error('Request failed:', { name: error.name, code: error.code, status: error.status });
  const status = error.status === 413 ? 413 : error.status === 503 ? 503 : 500;
  return res.status(status).json({
    message: status === 503 ? 'Service temporarily unavailable' : 'Something went wrong',
  });
});

export default app;
