// Account types
export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash';
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  lastUpdated: string;
}

// Transaction types
export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category: string;
  date: string;
  accountId: string;
  status: 'pending' | 'completed' | 'void';
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Chart of accounts
export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: string;
  description?: string;
  parentId?: string;
  balance: number;
  isActive: boolean;
}

// Journal entries
export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  entries: {
    accountId: string;
    debit?: number;
    credit?: number;
    description?: string;
  }[];
  status: 'draft' | 'posted' | 'void';
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Budget types
export interface Budget {
  id: string;
  name: string;
  period: {
    start: string;
    end: string;
  };
  items: {
    category: string;
    amount: number;
    actual?: number;
  }[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Tax types
export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  type: 'percentage' | 'fixed';
  description?: string;
  isActive: boolean;
  effectiveDate: string;
  metadata?: Record<string, unknown>;
}

// Report types
export type ReportType = 'balance_sheet' | 'income_statement' | 'cash_flow' | 'tax_summary';

export interface ReportConfig {
  type: ReportType;
  period: {
    start: string;
    end: string;
  };
  format: 'json' | 'pdf' | 'csv';
  filters?: Record<string, unknown>;
}

export interface ReportResponse {
  id: string;
  type: ReportType;
  data: Record<string, unknown>;
  generatedAt: string;
  config: ReportConfig;
  metadata: {
    generatedAt: string;
    period: {
      start: string;
      end: string;
    };
    filters?: Record<string, unknown>;
  };
}
