/**
 * Error Classification Utility
 * Provides centralized error categorization
 */

export enum ErrorCategory {
  /** Session has expired or is invalid - requires new session */
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  /** Network/connection issues - client should block user action */
  NETWORK = 'NETWORK',
  
  /** Server-side errors - retry */
  SERVER = 'SERVER',
  
  /** Client-side bugs - should block further action and expose details to user */
  CLIENT = 'CLIENT',
  
  /** Bad credentials - require user to provide valid credentials */
  CREDENTIALS = 'CREDENTIALS',

  UNKNOWN = 'UNKNOWN',
}

export class ErrorClassifier {
  /**
   * Categorize an error code into one of the defined error categories
   */
  static categorize(errorCode: string): ErrorCategory {
    // Session errors
    if (errorCode === 'ERR_INVALID_SESSIONID' || errorCode === 'ERR_SESSION_TIMEOUT') {
      return ErrorCategory.SESSION_EXPIRED;
    }

    // Credential errors
    if (errorCode === 'ERR_BAD_ACCESSCODE') {
      return ErrorCategory.CREDENTIALS;
    }

    // Network errors
    if (
      errorCode === 'ERR_SEND_REQUEST' ||
      errorCode === 'ERR_INTERNET_DISCONNECTED' 
    ) {
      return ErrorCategory.NETWORK;
    }

    // Client errors (internal bugs - hide details from user)
    if (
      errorCode === 'ERR_MISSING_PARAMETER' ||
      errorCode === 'ERR_UNKNOWN_PARAMETER' ||
      errorCode === 'ERR_BAD_PARAMETER_TYPE' ||
      errorCode === 'ERR_MISSING_AGENTMESSAGEID' ||
      errorCode === 'ERR_UNEXPECTED_AGENTMESSAGEID' ||
      errorCode === 'ERR_UNHANDLED_REQUEST'
    ) {
      return ErrorCategory.CLIENT;
    }
    if (errorCode === 'ERR_PROXY_ERROR' ||
      errorCode === 'ERR_PROXY_TIMEOUT' ||
      errorCode === 'ERR_SYSTEM_ERROR' ||
      errorCode === 'ERR_SERVER_TIMEOUT'
    ) {
      return ErrorCategory.SERVER;
    }

    // Server errors (default for unknown errors too)
    return ErrorCategory.UNKNOWN;
  }
}
