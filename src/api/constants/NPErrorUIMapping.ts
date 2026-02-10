/**
 * Error Code Mapping for the Frontend Error Modal
 * Maps error codes to names and messages
 */



import { ErrorCategory } from '../core/ErrorClassifier';

export interface ErrorInfo {
  /** Short error name/title to display in the modal header */
  name: string;
  /** Error message explaining what happened */
  message: string;
  /** Error category for handling logic */
  category: ErrorCategory;
}

export const NPErrorCodeMapping: Record<string, ErrorInfo> = {
  // ============================================================================
  // Session-related Errors
  // ============================================================================
  ERR_INVALID_SESSIONID: {
    name: 'Invalid Session',
    message: 'Your session is no longer valid. Please start a new session.',
    category: ErrorCategory.SESSION_EXPIRED,
  },
  ERR_SESSION_TIMEOUT: {
    name: 'Session Timeout',
    message: 'Your session has expired due to inactivity.',
    category: ErrorCategory.SESSION_EXPIRED,
  },

  // ============================================================================
  // Access & Authentication Errors
  // ============================================================================

  ERR_BAD_ACCESSCODE: {
    name: 'Invalid Access Code',
    message: 'The access code provided is invalid or has expired.',
    category: ErrorCategory.CREDENTIALS,
  },

  // ============================================================================
  // System & Server Errors
  // ============================================================================
  ERR_SERVER_CONNECTION: {
    name: 'Server Connection Error',
    message: 'Unable to connect to the server. Please try again later.',
    category: ErrorCategory.SERVER,
  },
  ERR_ACCESS_ERROR: {
    name: 'Access Denied',
    message: 'You do not have permission to access this resource.',
    category: ErrorCategory.SERVER,
  },
  ERR_SYSTEM_ERROR: {
    name: 'System Error',
    message: 'An unexpected system error occurred. Please try again.',
    category: ErrorCategory.SERVER,
  },
  ERR_EXCEPTION: {
    name: 'Server Exception',
    message: 'The server encountered an unexpected error while processing your request.',
    category: ErrorCategory.SERVER,
  },

  ERR_PROXY_ERROR: {
    name: 'Proxy Error',
    message: 'Unable to connect to the server. The proxy returned an error (502).',
    category: ErrorCategory.SERVER,
  },
  ERR_PROXY_TIMEOUT: {
    name: 'Gateway Timeout',
    message: 'The server is taking too long to respond.',
    category: ErrorCategory.SERVER,
  },

  // ============================================================================
  // Network & Communication Errors
  // ============================================================================

  ERR_SEND_REQUEST: {
    name: 'Network Error',
    message: 'Failed to send your request due to a network error.',
    category: ErrorCategory.NETWORK,
  },
  ERR_INTERNET_DISCONNECTED: {
    name: 'No Internet Connection',
    message: 'You appear to be offline. Please check your internet connection.',
    category: ErrorCategory.NETWORK,
  },

  // ============================================================================
  // Client Errors (Internal - Technical details hidden from users)
  // ============================================================================
  ERR_MISSING_PARAMETER: {
    name: 'Client Error',
    message: 'A client error has occurred. Please contact our support team for assistance.',
    category: ErrorCategory.CLIENT,
  },
  ERR_UNKNOWN_PARAMETER: {
    name: 'Client Error',
    message: 'A client error has occurred. Please contact our support team for assistance.',
    category: ErrorCategory.CLIENT,
  },
  ERR_BAD_PARAMETER_TYPE: {
    name: 'Client Error',
    message: 'A client error has occurred. Please contact our support team for assistance.',
    category: ErrorCategory.CLIENT,
  },
  ERR_MISSING_AGENTMESSAGEID: {
    name: 'Client Error',
    message: 'A client error has occurred. Please contact our support team for assistance.',
    category: ErrorCategory.CLIENT,
  },
  ERR_UNEXPECTED_AGENTMESSAGEID: {
    name: 'Client Error',
    message: 'A client error has occurred. Please contact our support team for assistance.',
    category: ErrorCategory.CLIENT,
  },
  ERR_UNHANDLED_REQUEST: {
    name: 'Client Error',
    message: 'A client error has occurred. Please contact our support team for assistance.',
    category: ErrorCategory.CLIENT,
  },
};

/**
 * Get error information for a given error code
 * Returns a default error info if the code is not found in the mapping
 */
export function getErrorInfo(errorCode: string): ErrorInfo {
  return (
    NPErrorCodeMapping[errorCode] || {
      name: 'Unknown Error',
      message: `An error occurred: ${errorCode}`,
      category: ErrorCategory.SERVER,
    }
  );
}

/**
 * Format an error for display in the error modal
 * Combines error code mapping with optional custom error message from server
 */
export function formatError(
  errorCode: string,
  serverMessage?: string
): {
  name: string;
  message: string;
} {
  const errorInfo = getErrorInfo(errorCode);

  return {
    name: errorInfo.name,
    message: serverMessage || errorInfo.message,
  };
}
