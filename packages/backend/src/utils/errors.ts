import { ErrorCodes } from '@accounting-agent/shared';

// Base error class for application errors
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCodes.VALIDATION_ERROR, 400, details);
  }
}

// Not found error
export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCodes.NOT_FOUND, 404, details);
  }
}

// Unauthorized error
export class UnauthorizedError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCodes.UNAUTHORIZED, 401, details);
  }
}

// Forbidden error
export class ForbiddenError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCodes.FORBIDDEN, 403, details);
  }
}

// Conflict error
export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCodes.CONFLICT, 409, details);
  }
}

// Service unavailable error
export class ServiceUnavailableError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCodes.SERVICE_UNAVAILABLE, 503, details);
  }
}

// Command processing error
export class CommandProcessingError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'COMMAND_PROCESSING_ERROR', 400, details);
  }
}

// OpenAI error
export class OpenAIError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'OPENAI_ERROR', 503, details);
  }
}

// Accounting software error
export class AccountingSoftwareError extends AppError {
  constructor(message: string, code: string, details?: unknown) {
    super(message, code, 503, details);
  }
}

// Error factory function
export const createError = (
  message: string,
  code: string = ErrorCodes.INTERNAL_ERROR,
  statusCode: number = 500,
  details?: unknown
): AppError => {
  return new AppError(message, code, statusCode, details);
};

// Error response formatter
export const formatErrorResponse = (error: Error): Record<string, unknown> => {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  // Handle unknown errors
  return {
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    },
  };
};

// Error handler for async routes
export const asyncHandler = 
  (fn: (...args: any[]) => Promise<any>) =>
  (...args: any[]): Promise<any> => {
    const fnReturn = fn(...args);
    const next = args[args.length - 1];
    return Promise.resolve(fnReturn).catch(next);
  };
