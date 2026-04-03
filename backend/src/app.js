import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import predictionRoutes from './routes/prediction.js';
import regionRoutes from './routes/region.js';
import chatRoutes from './routes/chat.js';
import newsRoutes from './routes/news.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Routes
app.use('/api', predictionRoutes);
app.use('/api', regionRoutes);
app.use('/api', chatRoutes);
app.use('/api', newsRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    service: 'civicshield-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mlService: {
      status: 'unknown',
      url: process.env.ML_SERVICE_URL || 'http://localhost:8000'
    }
  };

  // Check ML service health
  try {
    const { checkMLHealth } = await import('./services/mlProxy.js');
    const mlHealth = await checkMLHealth();
    health.mlService.status = 'healthy';
    health.mlService.details = mlHealth;
  } catch (error) {
    health.mlService.status = 'unhealthy';
    health.mlService.error = error.message;
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Error handler
app.use(errorHandler);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[CRITICAL] Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Log but don't exit - keep server running
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  // Log but don't exit - keep server running
});

app.listen(PORT, () => {
  console.log(`🛡️  CivicShield Gateway running on http://localhost:${PORT}`);
  console.log(`📡 ML Service URL: ${process.env.ML_SERVICE_URL || 'http://localhost:8000'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;
