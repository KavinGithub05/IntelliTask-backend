import express, { Express } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/tasks.routes';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || '';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`✓ Backend server running on http://localhost:${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
    });
  } catch (err: any) {
    console.error('✗ Connection failed:', err.message);
    process.exit(1);
  }
};

connectDB();

export default app;
