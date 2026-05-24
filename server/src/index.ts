import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import authLogsRoutes from './routes/authLogs.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const origin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
const allowedOrigins = Array.from(
  new Set([
    origin,
    'http://localhost:5173',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
  ]),
).filter(Boolean);

app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/auth-logs', authLogsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(port, () => {
  console.log(`DOTS Daily backend listening on http://localhost:${port}`);
});
