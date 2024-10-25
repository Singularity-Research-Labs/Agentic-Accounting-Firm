import {
  Account,
  Transaction,
  ChartOfAccount,
  JournalEntry,
  Budget,
  ReportType,
  ReportConfig,
  TaxRate,
} from '@accounting-agent/shared';

// Authentication types
export interface AuthCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  environment: 'sandbox' | 'production';
}

// Filter types
export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: string;
}

export interface JournalEntryFilters {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  type?: string;
}

// Report types
export interface Report {
  id: string;
  type: ReportType;
  data: unknown;
  generatedAt: string;
  config: ReportConfig;
}

// Sync types
export interface SyncResult {
  success: boolean;
  lastSyncTime: string;
  details: {
    accountsUpdated: number;
    transactionsUpdated: number;
    errors?: string[];
  };
}

// Error types
export class AccountingSoftwareError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'AccountingSoftwareError';
  }
}

// Adapter interface
export interface AccountingSoftwareAdapter {
  // Account operations
  getAccounts(): Promise<Account[]>;
  getAccount(id: string): Promise<Account>;
  createAccount(account: Omit<Account, 'id'>): Promise<Account>;
  updateAccount(id: string, account: Partial<Account>): Promise<Account>;
  deleteAccount(id: string): Promise<void>;

  // Transaction operations
  getTransactions(filters?: TransactionFilters): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction>;
  createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  categorizeTransaction(id: string, category: string): Promise<Transaction>;

  // Chart of accounts operations
  getChartOfAccounts(): Promise<ChartOfAccount[]>;
  updateChartOfAccounts(accounts: ChartOfAccount[]): Promise<void>;

  // Journal entry operations
  createJournalEntry(entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry>;
  getJournalEntries(filters?: JournalEntryFilters): Promise<JournalEntry[]>;

  // Budget operations
  getBudgets(): Promise<Budget[]>;
  createBudget(budget: Omit<Budget, 'id'>): Promise<Budget>;
  updateBudget(id: string, budget: Partial<Budget>): Promise<Budget>;

  // Tax operations
  getTaxRates(): Promise<TaxRate[]>;
  calculateTax(amount: number, taxRateId: string): Promise<number>;

  // Report operations
  generateReport(type: ReportType, config: ReportConfig): Promise<Report>;

  // Sync operations
  sync(): Promise<SyncResult>;
  getLastSyncTime(): Promise<string>;
}
