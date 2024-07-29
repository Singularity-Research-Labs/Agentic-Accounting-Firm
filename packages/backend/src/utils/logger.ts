import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, printf, colorize } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata, null, 2)}`;
  }
  
  return msg;
});

// Create base logger configuration
const baseLogger = winston.createLogger({
  level: config.logging.level,
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        logFormat
      ),
    }),
  ],
});

// Add file transport in production
if (config.logging.file) {
  baseLogger.add(
    new winston.transports.File({
      filename: config.logging.filePath || 'logs/app.log',
      format: logFormat,
    })
  );
}

// Create namespaced loggers
export const logger = baseLogger.child({});
export const httpLogger = baseLogger.child({ namespace: 'http' });
export const openaiLogger = baseLogger.child({ namespace: 'openai' });
export const accountingLogger = baseLogger.child({ namespace: 'accounting' });
export const commandLogger = baseLogger.child({ namespace: 'command' });

// Export default logger
export default logger;

// Error logging helper
export const logError = (error: Error, context?: Record<string, unknown>): void => {
  const errorDetails = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...context,
  };

  logger.error('An error occurred', errorDetails);
};

// Request logging format for Morgan
export const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

// Morgan stream configuration
export const morganStream = {
  write: (message: string) => {
    httpLogger.info(message.trim());
  },
};
