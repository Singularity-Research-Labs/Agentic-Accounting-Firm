// Command status
export enum CommandStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  PROCESSING = 'processing',
  FAILED = 'failed',
  REQUIRES_CLARIFICATION = 'requires_clarification',
}

// Parsed command
export interface ParsedCommand {
  originalText: string;
  intent: CommandIntent;
  confidence: number;
  entities: Record<string, unknown>;
  context: CommandContext;
}

// Command result
export interface CommandResult {
  id: string;
  status: CommandStatus;
  command: ParsedCommand;
  result: {
    success: boolean;
    data: unknown;
    error?: {
      code: string;
      message: string;
      details?: unknown;
    };
  };
  executionTime: number;
  timestamp: string;
}

// Command history entry
export interface CommandHistoryEntry {
  id: string;
  userId: string;
  command: ParsedCommand;
  result: CommandResult;
  timestamp: string;
}

export interface CommandContext {
  userId: string;
  timestamp: string;
  source: 'voice' | 'text' | 'api' | 'system';
  metadata?: Record<string, unknown>;
  previousCommand?: string;
  sessionId: string;
}

// Command intent types
export type CommandIntent = 
  | 'create_transaction'
  | 'update_transaction'
  | 'delete_transaction'
  | 'get_transactions'
  | 'get_account_balance'
  | 'generate_report'
  | 'tax_query';

// Command intent schema
export const CommandIntentSchema = {
  safeParse: (value: unknown): { success: boolean } => {
    if (typeof value !== 'string') return { success: false };
    const validIntents = [
      'create_transaction',
      'update_transaction',
      'delete_transaction',
      'get_transactions',
      'get_account_balance',
      'generate_report',
      'tax_query',
    ];
    return { success: validIntents.includes(value) };
  },
};
