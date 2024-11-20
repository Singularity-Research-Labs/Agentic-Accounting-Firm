import {
  Account,
  Transaction,
  ChartOfAccount,
  JournalEntry,
  Budget,
  ReportType,
  ReportConfig,
  TaxRate,
  ReportResponse,
} from '@accounting-agent/shared';
import {
  AccountingSoftwareAdapter,
  TransactionFilters,
  JournalEntryFilters,
  Report,
  SyncResult,
} from './types';
import { quickBooksAdapter } from './quickbooks-adapter';
import { config } from '../../config';
import { accountingLogger as logger } from '../../utils/logger';

class AccountingService {
  private adapter: AccountingSoftwareAdapter;
  private static instance: AccountingService;

  private constructor() {
    // Initialize the appropriate adapter based on configuration
    switch (config.accounting.provider) {
      case 'quickbooks':
        this.adapter = quickBooksAdapter;
        break;
      default:
        throw new Error(`Unsupported accounting provider: ${config.accounting.provider}`);
    }
  }

  public static getInstance(): AccountingService {
    if (!AccountingService.instance) {
      AccountingService.instance = new AccountingService();
    }
    return AccountingService.instance;
  }

  // Account operations
  public async getAccounts(): Promise<Account[]> {
    logger.info('Getting all accounts');
    return this.adapter.getAccounts();
  }

  public async getAccount(id: string): Promise<Account> {
    logger.info('Getting account', { id });
    return this.adapter.getAccount(id);
  }

  public async createAccount(account: Omit<Account, 'id'>): Promise<Account> {
    logger.info('Creating account', { account });
    return this.adapter.createAccount(account);
  }

  public async updateAccount(id: string, account: Partial<Account>): Promise<Account> {
    logger.info('Updating account', { id, account });
    return this.adapter.updateAccount(id, account);
  }

  public async deleteAccount(id: string): Promise<void> {
    logger.info('Deleting account', { id });
    return this.adapter.deleteAccount(id);
  }

  // Transaction operations
  public async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    logger.info('Getting transactions', { filters });
    return this.adapter.getTransactions(filters);
  }

  public async getTransaction(id: string): Promise<Transaction> {
    logger.info('Getting transaction', { id });
    return this.adapter.getTransaction(id);
  }

  public async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    logger.info('Creating transaction', { transaction });
    return this.adapter.createTransaction(transaction);
  }

  public async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    logger.info('Updating transaction', { id, transaction });
    return this.adapter.updateTransaction(id, transaction);
  }

  public async deleteTransaction(id: string): Promise<void> {
    logger.info('Deleting transaction', { id });
    return this.adapter.deleteTransaction(id);
  }

  public async categorizeTransaction(id: string, category: string): Promise<Transaction> {
    logger.info('Categorizing transaction', { id, category });
    return this.adapter.categorizeTransaction(id, category);
  }

  // Chart of accounts operations
  public async getChartOfAccounts(): Promise<ChartOfAccount[]> {
    logger.info('Getting chart of accounts');
    return this.adapter.getChartOfAccounts();
  }

  public async updateChartOfAccounts(accounts: ChartOfAccount[]): Promise<void> {
    logger.info('Updating chart of accounts');
    return this.adapter.updateChartOfAccounts(accounts);
  }

  // Journal entry operations
  public async createJournalEntry(entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
    logger.info('Creating journal entry', { entry });
    return this.adapter.createJournalEntry(entry);
  }

  public async getJournalEntries(filters?: JournalEntryFilters): Promise<JournalEntry[]> {
    logger.info('Getting journal entries', { filters });
    return this.adapter.getJournalEntries(filters);
  }

  // Budget operations
  public async getBudgets(): Promise<Budget[]> {
    logger.info('Getting budgets');
    return this.adapter.getBudgets();
  }

  public async createBudget(budget: Omit<Budget, 'id'>): Promise<Budget> {
    logger.info('Creating budget', { budget });
    return this.adapter.createBudget(budget);
  }

  public async updateBudget(id: string, budget: Partial<Budget>): Promise<Budget> {
    logger.info('Updating budget', { id, budget });
    return this.adapter.updateBudget(id, budget);
  }

  // Tax operations
  public async getTaxRates(): Promise<TaxRate[]> {
    logger.info('Getting tax rates');
    return this.adapter.getTaxRates();
  }

  public async calculateTax(amount: number, taxRateId: string): Promise<number> {
    logger.info('Calculating tax', { amount, taxRateId });
    return this.adapter.calculateTax(amount, taxRateId);
  }

  // Report operations
  public async generateReport(type: ReportType, config: ReportConfig): Promise<ReportResponse> {
    logger.info('Generating report', { type, config });
    const report = await this.adapter.generateReport(type, config);
    return {
      id: report.id,
      type: report.type,
      data: report.data as Record<string, unknown>,
      generatedAt: report.generatedAt,
      config: report.config,
      metadata: {
        generatedAt: new Date().toISOString(),
        period: {
          start: config.period.start,
          end: config.period.end,
        },
        filters: config.filters,
      },
    };
  }

  // Sync operations
  public async sync(): Promise<SyncResult> {
    logger.info('Starting sync operation');
    return this.adapter.sync();
  }

  public async getLastSyncTime(): Promise<string> {
    logger.info('Getting last sync time');
    return this.adapter.getLastSyncTime();
  }

  // Command execution
  public async executeCommand(command: {
    intent: string;
    entities: Record<string, unknown>;
  }): Promise<unknown> {
    logger.info('Executing command', { command });

    // Example command handling
    switch (command.intent) {
      case 'get_transactions':
        return this.getTransactions({
          startDate: command.entities.startDate as string,
          endDate: command.entities.endDate as string,
          accountId: command.entities.accountId as string,
          category: command.entities.category as string,
          minAmount: command.entities.minAmount as number,
          maxAmount: command.entities.maxAmount as number,
          status: command.entities.status as string,
        });

      case 'get_account_balance':
        const account = await this.getAccount(command.entities.accountId as string);
        return {
          balance: account.balance,
          currency: account.currency,
          lastUpdated: account.lastUpdated,
        };

      // Add more command handlers as needed

      default:
        throw new Error(`Unsupported command intent: ${command.intent}`);
    }
  }
}

export const accountingService = AccountingService.getInstance();
