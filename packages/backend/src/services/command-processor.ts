import { type UploadedFile } from 'express-fileupload';
import {
  type CommandContext,
  type CommandResult,
  type CommandHistoryEntry,
  type ParsedCommand,
  CommandStatus,
} from '@accounting-agent/shared';
import { openai } from './openai';
import { accountingService } from './accounting/accounting-service';
import { commandLogger as logger } from '../utils/logger';
import { CommandProcessingError } from '../utils/errors';

class CommandProcessor {
  private static instance: CommandProcessor;

  private constructor() {}

  public static getInstance(): CommandProcessor {
    if (!CommandProcessor.instance) {
      CommandProcessor.instance = new CommandProcessor();
    }
    return CommandProcessor.instance;
  }

  /**
   * Process a text command
   */
  public async processTextCommand(input: {
    text: string;
    context: CommandContext;
  }): Promise<CommandResult> {
    try {
      logger.info('Processing text command', { text: input.text });

      // Parse command using OpenAI
      const parsedCommand = await openai.parseCommand(input.text, input.context);

      // Execute command
      const result = await this.executeCommand(parsedCommand);

      return result;
    } catch (error) {
      logger.error('Failed to process text command', { error, input });
      throw new CommandProcessingError(
        error instanceof Error ? error.message : 'Failed to process text command'
      );
    }
  }

  /**
   * Process a voice command
   */
  public async processVoiceCommand(
    audioFile: UploadedFile,
    metadata?: Record<string, unknown>
  ): Promise<CommandResult> {
    try {
      logger.info('Processing voice command', { metadata });

      // Transcribe audio to text
      const text = await openai.transcribeAudio(audioFile);

      // Create command context
      const context: CommandContext = {
        userId: 'system', // TODO: Get from auth context
        timestamp: new Date().toISOString(),
        source: 'voice',
        sessionId: crypto.randomUUID(),
        metadata,
      };

      // Process as text command
      return this.processTextCommand({ text, context });
    } catch (error) {
      logger.error('Failed to process voice command', { error });
      throw new CommandProcessingError(
        error instanceof Error ? error.message : 'Failed to process voice command'
      );
    }
  }

  /**
   * Execute a parsed command
   */
  private async executeCommand(command: ParsedCommand): Promise<CommandResult> {
    try {
      logger.info('Executing command', { intent: command.intent });

      // Execute command using accounting service
      const data = await accountingService.executeCommand({
        intent: command.intent,
        entities: command.entities,
      });

      return {
        id: crypto.randomUUID(),
        status: CommandStatus.COMPLETED,
        command,
        result: {
          success: true,
          data,
        },
        executionTime: Date.now() - new Date(command.context.timestamp).getTime(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to execute command', { error, command });
      throw new CommandProcessingError(
        error instanceof Error ? error.message : 'Failed to execute command'
      );
    }
  }

  /**
   * Get command suggestions
   */
  public async getCommandSuggestions(
    userId: string,
    context?: string,
    limit = 5
  ): Promise<string[]> {
    try {
      logger.info('Getting command suggestions', { userId, context });
      return openai.generateCommandSuggestions(userId, context, limit);
    } catch (error) {
      logger.error('Failed to get command suggestions', { error });
      throw new CommandProcessingError(
        error instanceof Error ? error.message : 'Failed to get command suggestions'
      );
    }
  }

  /**
   * Get command history
   */
  public async getCommandHistory(filters: {
    userId: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<CommandHistoryEntry[]> {
    try {
      logger.info('Getting command history', { filters });
      // TODO: Implement command history storage and retrieval
      return [];
    } catch (error) {
      logger.error('Failed to get command history', { error });
      throw new CommandProcessingError(
        error instanceof Error ? error.message : 'Failed to get command history'
      );
    }
  }
}

export const commandProcessor = CommandProcessor.getInstance();
