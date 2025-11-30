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
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // Allow Vercel deployments
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }

    // Allow same origin (for unified deployment)
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB (for serverless)
const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      console.warn('⚠️ MONGO_URI environment variable is not set');
      return;
    }

    // Only connect if not already connected (for serverless reuse)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
      console.log('✓ Connected to MongoDB');
    }
  } catch (err: any) {
    console.error('✗ MongoDB connection failed:', err.message);
    // Don't exit in serverless environment
  }
};

// For Vercel serverless functions
export default async (req: any, res: any) => {
  try {
    // Connect to database if needed
    await connectDB();

    // Set up Express app to handle the request
    app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Also export the app for local development
export { app };

// For local development
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`✓ Backend server running on http://localhost:${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
    });
  });
}
