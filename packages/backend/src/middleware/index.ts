import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { z } from 'zod';
import { config } from '../config';
import { AppError, formatErrorResponse } from '../utils/errors';
import { morganFormat, morganStream } from '../utils/logger';

// Rate limiting middleware
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
});

// CORS configuration
export const corsOptions = {
  origin: config.security.corsOrigin,
  methods: config.security.corsMethods.split(','),
  credentials: config.security.corsCredentials,
  maxAge: 86400, // 24 hours
};

// Request logging middleware
export const requestLogger = morgan(morganFormat, { stream: morganStream });

// Error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errorResponse = formatErrorResponse(err);
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  res.status(statusCode).json(errorResponse);
};

// Request validation middleware
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        });
        return;
      }
      next(error);
    }
  };
};

// Not found middleware
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
    },
  });
};

// Security middleware
export const securityMiddleware = [
  helmet(),
  cors(corsOptions),
  helmet.hidePoweredBy(),
  helmet.noSniff(),
  helmet.xssFilter(),
];

// Feature flag middleware
export const checkFeatureFlag = (flag: keyof typeof config.features) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (config.features[flag]) {
      next();
    } else {
      res.status(404).json({
        success: false,
        error: {
          code: 'FEATURE_DISABLED',
          message: `The ${flag} feature is currently disabled`,
        },
      });
    }
  };
};

// Authentication middleware (placeholder - implement actual auth logic)
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // TODO: Implement actual authentication logic
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
    return;
  }

  // For now, just pass through
  next();
};

// Export all middleware
export const middleware = {
  rateLimiter,
  corsOptions,
  requestLogger,
  errorHandler,
  notFoundHandler,
  securityMiddleware,
  checkFeatureFlag,
  requireAuth,
  validateRequest,
};

export default middleware;
