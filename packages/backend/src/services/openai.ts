import { type UploadedFile } from 'express-fileupload';
import OpenAI from 'openai';
import { openaiLogger as logger } from '../utils/logger';
import { OpenAIError } from '../utils/errors';
import { config } from '../config';
import {
  type ParsedCommand,
  type CommandContext,
  CommandIntentSchema,
} from '@accounting-agent/shared';

class OpenAIService {
  private client: OpenAI;
  private static instance: OpenAIService;

  private constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * Parse a natural language command into structured data
   */
  public async parseCommand(
    text: string,
    context: CommandContext
  ): Promise<ParsedCommand> {
    try {
      logger.info('Parsing command', { text });

      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that helps parse natural language commands into structured data for an accounting system. Parse the following command into a JSON object with intent, confidence, and entities.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: config.openai.temperature,
        max_tokens: config.openai.maxTokens,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      // Validate the parsed command
      if (!CommandIntentSchema.safeParse(result.intent).success) {
        throw new Error(`Invalid intent: ${result.intent}`);
      }

      return {
        originalText: text,
        intent: result.intent,
        confidence: result.confidence || 0.8,
        entities: result.entities || {},
        context,
      };
    } catch (error) {
      logger.error('Failed to parse command', { error, text });
      throw new OpenAIError(
        error instanceof Error ? error.message : 'Failed to parse command'
      );
    }
  }

  /**
   * Transcribe audio to text
   */
  public async transcribeAudio(audioFile: UploadedFile): Promise<string> {
    try {
      logger.info('Transcribing audio');

      const response = await this.client.audio.transcriptions.create({
        file: audioFile.data as any, // Type assertion needed due to OpenAI types limitation
        model: 'whisper-1',
        language: 'en',
        response_format: 'text',
      });

      return response;
    } catch (error) {
      logger.error('Failed to transcribe audio', { error });
      throw new OpenAIError(
        error instanceof Error ? error.message : 'Failed to transcribe audio'
      );
    }
  }

  /**
   * Generate command suggestions
   */
  public async generateCommandSuggestions(
    userId: string,
    context?: string,
    limit = 5
  ): Promise<string[]> {
    try {
      logger.info('Generating command suggestions', { userId, context });

      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that helps generate accounting command suggestions. Generate ${limit} natural language command suggestions for the accounting system.${
              context ? ` Context: ${context}` : ''
            }`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
        n: limit,
      });

      return response.choices.map(choice => 
        choice.message.content?.trim() || ''
      ).filter(Boolean);
    } catch (error) {
      logger.error('Failed to generate suggestions', { error, userId, context });
      throw new OpenAIError(
        error instanceof Error ? error.message : 'Failed to generate suggestions'
      );
    }
  }
}

export const openai = OpenAIService.getInstance();
