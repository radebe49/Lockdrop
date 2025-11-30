/**
 * Standardized error messages and error types
 *
 * Provides consistent error messaging across the application
 * with user-friendly messages and recovery suggestions.
 */

/**
 * Error codes for categorization
 */
export enum ErrorCode {
  // Network errors
  NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
  NETWORK_UNAVAILABLE = "NETWORK_UNAVAILABLE",
  CONNECTION_REFUSED = "CONNECTION_REFUSED",
  
  // Authentication errors
  AUTH_REQUIRED = "AUTH_REQUIRED",
  AUTH_FAILED = "AUTH_FAILED",
  WALLET_NOT_FOUND = "WALLET_NOT_FOUND",
  WALLET_LOCKED = "WALLET_LOCKED",
  
  // Storage errors
  STORAGE_NOT_CONFIGURED = "STORAGE_NOT_CONFIGURED",
  STORAGE_UPLOAD_FAILED = "STORAGE_UPLOAD_FAILED",
  STORAGE_DOWNLOAD_FAILED = "STORAGE_DOWNLOAD_FAILED",
  INVALID_CID = "INVALID_CID",
  
  // Contract errors
  CONTRACT_NOT_CONFIGURED = "CONTRACT_NOT_CONFIGURED",
  CONTRACT_CALL_FAILED = "CONTRACT_CALL_FAILED",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  
  // Validation errors
  INVALID_ADDRESS = "INVALID_ADDRESS",
  INVALID_TIMESTAMP = "INVALID_TIMESTAMP",
  INVALID_FILE_SIZE = "INVALID_FILE_SIZE",
  INVALID_MEDIA_TYPE = "INVALID_MEDIA_TYPE",
  
  // Crypto errors
  ENCRYPTION_FAILED = "ENCRYPTION_FAILED",
  DECRYPTION_FAILED = "DECRYPTION_FAILED",
  KEY_GENERATION_FAILED = "KEY_GENERATION_FAILED",
  
  // Generic errors
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  OPERATION_CANCELLED = "OPERATION_CANCELLED",
}

/**
 * Standardized error messages with user-friendly text and recovery suggestions
 */
export const ERROR_MESSAGES: Record<ErrorCode, { message: string; recovery: string }> = {
  // Network errors
  [ErrorCode.NETWORK_TIMEOUT]: {
    message: "The operation timed out. The network may be slow or unavailable.",
    recovery: "Please check your internet connection and try again.",
  },
  [ErrorCode.NETWORK_UNAVAILABLE]: {
    message: "Unable to connect to the network.",
    recovery: "Please check your internet connection and try again.",
  },
  [ErrorCode.CONNECTION_REFUSED]: {
    message: "Connection to the server was refused.",
    recovery: "The service may be temporarily unavailable. Please try again later.",
  },
  
  // Authentication errors
  [ErrorCode.AUTH_REQUIRED]: {
    message: "Authentication is required to perform this action.",
    recovery: "Please connect your wallet or sign in to continue.",
  },
  [ErrorCode.AUTH_FAILED]: {
    message: "Authentication failed.",
    recovery: "Please check your credentials and try again.",
  },
  [ErrorCode.WALLET_NOT_FOUND]: {
    message: "No compatible wallet found.",
    recovery: "Please install Talisman or MetaMask browser extension.",
  },
  [ErrorCode.WALLET_LOCKED]: {
    message: "Your wallet is locked.",
    recovery: "Please unlock your wallet and try again.",
  },
  
  // Storage errors
  [ErrorCode.STORAGE_NOT_CONFIGURED]: {
    message: "Storage is not configured.",
    recovery: "Please go to Settings and connect with Storacha using your email.",
  },
  [ErrorCode.STORAGE_UPLOAD_FAILED]: {
    message: "Failed to upload file to storage.",
    recovery: "Please check your connection and try again. If the problem persists, try a smaller file.",
  },
  [ErrorCode.STORAGE_DOWNLOAD_FAILED]: {
    message: "Failed to download file from storage.",
    recovery: "The file may be temporarily unavailable. Please try again later.",
  },
  [ErrorCode.INVALID_CID]: {
    message: "Invalid content identifier (CID).",
    recovery: "The file reference is invalid. Please check the link and try again.",
  },
  
  // Contract errors
  [ErrorCode.CONTRACT_NOT_CONFIGURED]: {
    message: "Smart contract is not configured.",
    recovery: "Please check the application configuration.",
  },
  [ErrorCode.CONTRACT_CALL_FAILED]: {
    message: "Failed to read from the blockchain.",
    recovery: "The blockchain may be congested. Please try again in a few moments.",
  },
  [ErrorCode.TRANSACTION_FAILED]: {
    message: "Transaction failed.",
    recovery: "Please check your wallet balance and try again.",
  },
  
  // Validation errors
  [ErrorCode.INVALID_ADDRESS]: {
    message: "Invalid wallet address.",
    recovery: "Please enter a valid Ethereum address (0x...).",
  },
  [ErrorCode.INVALID_TIMESTAMP]: {
    message: "Invalid unlock time.",
    recovery: "Please select a future date and time.",
  },
  [ErrorCode.INVALID_FILE_SIZE]: {
    message: "File size exceeds the maximum limit.",
    recovery: "Please select a file smaller than 100MB.",
  },
  [ErrorCode.INVALID_MEDIA_TYPE]: {
    message: "Unsupported file format.",
    recovery: "Please select an audio (MP3, WAV, OGG) or video (MP4, WebM) file.",
  },
  
  // Crypto errors
  [ErrorCode.ENCRYPTION_FAILED]: {
    message: "Failed to encrypt the file.",
    recovery: "Please try again. If the problem persists, try a different file.",
  },
  [ErrorCode.DECRYPTION_FAILED]: {
    message: "Failed to decrypt the file.",
    recovery: "The encryption key may be invalid or the file may be corrupted.",
  },
  [ErrorCode.KEY_GENERATION_FAILED]: {
    message: "Failed to generate encryption keys.",
    recovery: "Please refresh the page and try again.",
  },
  
  // Generic errors
  [ErrorCode.UNKNOWN_ERROR]: {
    message: "An unexpected error occurred.",
    recovery: "Please try again. If the problem persists, refresh the page.",
  },
  [ErrorCode.OPERATION_CANCELLED]: {
    message: "The operation was cancelled.",
    recovery: "You can try again when ready.",
  },
};

/**
 * Application error with standardized code and messages
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly recovery: string;
  readonly cause?: Error;

  constructor(code: ErrorCode, cause?: Error, customMessage?: string) {
    const errorInfo = ERROR_MESSAGES[code];
    super(customMessage || errorInfo.message);
    this.name = "AppError";
    this.code = code;
    this.recovery = errorInfo.recovery;
    this.cause = cause;
  }

  /**
   * Get user-friendly error message with recovery suggestion
   */
  toUserMessage(): string {
    return `${this.message} ${this.recovery}`;
  }
}

/**
 * Create an AppError from an unknown error
 */
export function toAppError(error: unknown, defaultCode: ErrorCode = ErrorCode.UNKNOWN_ERROR): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const errorObj = error instanceof Error ? error : new Error(String(error));
  const message = errorObj.message.toLowerCase();

  // Detect error type from message
  if (message.includes("timed out") || message.includes("timeout") || message.includes("etimedout")) {
    return new AppError(ErrorCode.NETWORK_TIMEOUT, errorObj);
  }
  if (message.includes("network") || message.includes("fetch failed")) {
    return new AppError(ErrorCode.NETWORK_UNAVAILABLE, errorObj);
  }
  if (message.includes("connection refused") || message.includes("econnrefused")) {
    return new AppError(ErrorCode.CONNECTION_REFUSED, errorObj);
  }
  if (message.includes("wallet") && message.includes("not found")) {
    return new AppError(ErrorCode.WALLET_NOT_FOUND, errorObj);
  }
  if (message.includes("locked")) {
    return new AppError(ErrorCode.WALLET_LOCKED, errorObj);
  }
  if (message.includes("unauthorized") || message.includes("401")) {
    return new AppError(ErrorCode.AUTH_FAILED, errorObj);
  }

  return new AppError(defaultCode, errorObj);
}
