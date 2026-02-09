/**
 * Common types used across the application
 */

/**
 * Generic pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Error response from API
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: Record<string, unknown>;
}

/**
 * API Result wrapper
 */
export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
}

/**
 * Sort direction
 */
export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

/**
 * Generic sort configuration
 */
export interface SortConfig {
  field: string;
  direction: SortDirection;
}

/**
 * Generic filter operators
 */
export enum FilterOperator {
  Equals = 'eq',
  NotEquals = 'neq',
  GreaterThan = 'gt',
  GreaterThanOrEqual = 'gte',
  LessThan = 'lt',
  LessThanOrEqual = 'lte',
  Contains = 'contains',
  StartsWith = 'startsWith',
  EndsWith = 'endsWith',
  In = 'in',
  NotIn = 'notIn',
}

/**
 * Generic filter configuration
 */
export interface FilterConfig {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  page?: number;
  pageSize?: number;
  sort?: SortConfig;
  filters?: FilterConfig[];
}
