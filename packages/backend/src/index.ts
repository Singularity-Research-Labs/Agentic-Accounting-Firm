import express from 'express';
import fileUpload from 'express-fileupload';
import { config } from './config';
import {
  middleware,
  errorHandler,
  notFoundHandler,
  requestLogger,
  rateLimiter,
  securityMiddleware,
} from './middleware';
import router from './routes';
import { logger } from './utils/logger';

// Create Express app
const app = express();

// Apply security middleware
app.use(securityMiddleware);

// Request parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: config.server.maxFileSize || 5 * 1024 * 1024 }, // 5MB default
}));

// Apply rate limiting
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Mount API routes with version prefix
app.use(`/api/${config.server.apiVersion}`, router);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: config.server.version,
    environment: config.server.nodeEnv,
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(config.server.port, () => {
  logger.info(`Server running on port ${config.server.port} in ${config.server.nodeEnv} mode`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific error handling
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Application specific error handling
  process.exit(1);
});

export default app;
