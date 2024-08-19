import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  API_VERSION: z.string().default('v1'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE_ENABLED: z.string().transform(Boolean).default('false'),
  LOG_FILE_PATH: z.string().default('logs/app.log'),
  LOG_RETENTION_DAYS: z.string().transform(Number).default('30'),
  MAX_FILE_SIZE: z.string().transform(Number).default('5242880'), // 5MB default
  OPENAI_API_KEY: z.string(),
  OPENAI_MODEL: z.string().default('gpt-4'),
  OPENAI_TEMPERATURE: z.string().transform(Number).default('0.7'),
  OPENAI_MAX_TOKENS: z.string().transform(Number).default('2000'),
  CORS_ORIGIN: z.string().default('*'),
  CORS_METHODS: z.string().default('GET,POST,PUT,DELETE,OPTIONS'),
  CORS_CREDENTIALS: z.string().transform(Boolean).default('true'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  QUICKBOOKS_CLIENT_ID: z.string(),
  QUICKBOOKS_CLIENT_SECRET: z.string(),
  QUICKBOOKS_REDIRECT_URI: z.string().default('http://localhost:3000/callback'),
  QUICKBOOKS_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
  QUICKBOOKS_REFRESH_TOKEN: z.string(),
});

// Validate environment variables
const env = envSchema.parse(process.env);

// Package version (fallback to 0.1.0 if not available)
const packageVersion = process.env['npm_package_version'] || '0.1.0';

// Configuration object
export const config = {
  server: {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    apiVersion: env.API_VERSION,
    logLevel: env.LOG_LEVEL,
    maxFileSize: env.MAX_FILE_SIZE,
    version: packageVersion,
  },
  openai: {
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    temperature: env.OPENAI_TEMPERATURE,
    maxTokens: env.OPENAI_MAX_TOKENS,
  },
  security: {
    corsOrigin: env.CORS_ORIGIN,
    corsMethods: env.CORS_METHODS,
    corsCredentials: env.CORS_CREDENTIALS,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  logging: {
    level: env.LOG_LEVEL,
    console: env.NODE_ENV !== 'production',
    file: env.LOG_FILE_ENABLED,
    filePath: env.LOG_FILE_PATH,
    retentionDays: env.LOG_RETENTION_DAYS,
  },
  accounting: {
    provider: 'quickbooks' as const,
    quickbooks: {
      clientId: env.QUICKBOOKS_CLIENT_ID,
      clientSecret: env.QUICKBOOKS_CLIENT_SECRET,
      redirectUri: env.QUICKBOOKS_REDIRECT_URI,
      environment: env.QUICKBOOKS_ENVIRONMENT,
      refreshToken: env.QUICKBOOKS_REFRESH_TOKEN,
    },
  },
  features: {
    enableVoiceCommands: true,
    enableSuggestions: true,
    enableHistory: true,
  },
} as const;

// Environment helper functions
export const isDevelopment = config.server.nodeEnv === 'development';
export const isProduction = config.server.nodeEnv === 'production';
export const isTest = config.server.nodeEnv === 'test';

// Export server configuration
export const { server, openai, security, rateLimit, logging, features, accounting } = config;

// Export default config
export default config;
