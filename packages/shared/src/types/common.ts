// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

// Pagination parameters
export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

// Sort parameters
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// Filter operator types
export type FilterOperator = 
  | 'eq'    // equals
  | 'neq'   // not equals
  | 'gt'    // greater than
  | 'gte'   // greater than or equal
  | 'lt'    // less than
  | 'lte'   // less than or equal
  | 'in'    // in array
  | 'nin'   // not in array
  | 'like'  // string contains
  | 'nlike' // string does not contain
  | 'between'; // between two values

// Filter condition
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

// Query parameters
export interface QueryParams {
  pagination?: PaginationParams;
  sort?: SortParams[];
  filters?: FilterCondition[];
  includes?: string[];
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    pagination?: {
      total: number;
      page: number;
      pageSize: number;
      pages: number;
    };
    [key: string]: unknown;
  };
}

// Date range
export interface DateRange {
  start: string;
  end: string;
}

// Money amount with currency
export interface MoneyAmount {
  amount: number;
  currency: string;
}

// Error details
export interface ErrorDetails {
  code: string;
  message: string;
  field?: string;
  details?: unknown;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors?: ErrorDetails[];
}

// Audit log entry
export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: {
    before: Record<string, unknown>;
    after: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// Feature flag
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  conditions?: Record<string, unknown>;
}

// User preferences
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  dateFormat?: string;
  numberFormat?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  [key: string]: unknown;
}
