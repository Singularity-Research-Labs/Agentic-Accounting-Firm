import { Router } from 'express';
import { UploadedFile } from 'express-fileupload';
import { commandProcessor } from '../services/command-processor';
import { validateRequest, checkFeatureFlag } from '../middleware';
import { commandSchemas } from './index';
import { asyncHandler } from '../utils/errors';
import { commandLogger as logger } from '../utils/logger';

const router = Router();

// Process text command
router.post(
  '/process',
  validateRequest(commandSchemas.textCommand),
  asyncHandler(async (req, res) => {
    logger.info('Processing text command', { command: req.body.text });

    const result = await commandProcessor.processTextCommand(req.body);

    res.json({
      success: true,
      data: result,
    });
  })
);

// Process voice command
router.post(
  '/voice',
  checkFeatureFlag('enableVoiceCommands'),
  validateRequest(commandSchemas.voiceCommand),
  asyncHandler(async (req, res) => {
    if (!req.files?.audio || Array.isArray(req.files.audio)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Audio file is required',
        },
      });
      return;
    }

    const audioFile = req.files.audio as UploadedFile;
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : undefined;

    logger.info('Processing voice command', {
      filename: audioFile.name,
      size: audioFile.size,
      metadata,
    });

    const result = await commandProcessor.processVoiceCommand(audioFile, metadata);

    res.json({
      success: true,
      data: result,
    });
  })
);

// Get command suggestions
router.get(
  '/suggestions',
  checkFeatureFlag('enableSuggestions'),
  asyncHandler(async (req, res) => {
    const { userId, context, limit } = req.query;

    logger.info('Getting command suggestions', { userId, context });

    const suggestions = await commandProcessor.getCommandSuggestions(
      userId as string,
      context as string | undefined,
      limit ? Number(limit) : undefined
    );

    res.json({
      success: true,
      data: suggestions,
    });
  })
);

// Get command history
router.get(
  '/history',
  checkFeatureFlag('enableHistory'),
  asyncHandler(async (req, res) => {
    const { userId, startDate, endDate, limit, offset } = req.query;

    logger.info('Getting command history', { userId, startDate, endDate });

    const history = await commandProcessor.getCommandHistory({
      userId: userId as string,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });

    res.json({
      success: true,
      data: history,
    });
  })
);

export const commandRoutes = router;
