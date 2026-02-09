/**
 * Application-wide constants
 */

/**
 * Pagination
 */
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const MAX_PAGE_SIZE = 100;

/**
 * API Configuration
 */
export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY = 1000; // 1 second

/**
 * Date Formats
 */
export const DATE_FORMAT_SHORT = 'MMM d, yyyy'; // e.g., "Jan 1, 2024"
export const DATE_FORMAT_LONG = 'MMMM d, yyyy'; // e.g., "January 1, 2024"
export const DATE_FORMAT_ISO = 'yyyy-MM-dd'; // e.g., "2024-01-01"
export const DATETIME_FORMAT = 'MMM d, yyyy h:mm a'; // e.g., "Jan 1, 2024 2:30 PM"

/**
 * Account Configuration
 */
export const ACCOUNT_TYPES = [
  { value: 'Organization', label: 'Organization' },
  { value: 'Individual', label: 'Individual' },
];

export const ACCOUNT_STATUSES = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

/**
 * Ledger Configuration
 */
export const TRANSACTION_TYPES = [
  { value: 'RideCharge', label: 'Ride Charge' },
  { value: 'PaymentReceived', label: 'Payment Received' },
];

export const LEDGER_ACCOUNT_TYPES = [
  { value: 'AccountsReceivable', label: 'Accounts Receivable' },
  { value: 'ServiceRevenue', label: 'Service Revenue' },
  { value: 'Cash', label: 'Cash' },
];

/**
 * Invoice Configuration
 */
export const INVOICE_FREQUENCIES = [
  { value: 'PerRide', label: 'Per Ride' },
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
];

export const INVOICE_STATUSES = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Issued', label: 'Issued' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Overdue', label: 'Overdue' },
];

/**
 * Currency Configuration
 */
export const DEFAULT_CURRENCY = 'USD';
export const CURRENCY_SYMBOL = '$';

/**
 * Validation Configuration
 */
export const MAX_NAME_LENGTH = 200;
export const MAX_EMAIL_LENGTH = 100;
export const MAX_NOTES_LENGTH = 1000;
export const MAX_REFERENCE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;

/**
 * UI Configuration
 */
export const DEBOUNCE_TIME = 300; // milliseconds for search input debounce
export const TOAST_DURATION = 3000; // milliseconds for snackbar notifications
export const LOADING_DELAY = 200; // milliseconds before showing loading spinner
