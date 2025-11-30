/**
 * Retry Utilities
 *
 * Provides retry logic with exponential backoff for handling
 * transient failures in network operations.
 *
 * Features:
 * - Exponential backoff with configurable multiplier
 * - Jitter to prevent thundering herd
 * - Customizable retry conditions
 * - Retry callbacks for logging/monitoring
 * - Context support for better error messages
 */

import { isRetryableError } from "./errorHandling";

/**
 * Retry options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in ms before first retry (default: 1000) */
  initialDelay?: number;
  /** Maximum delay in ms between retries (default: 30000) */
  maxDelay?: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  /** Jitter factor 0-1 for randomizing delays (default: 0.3) */
  jitterFactor?: number;
  /** Callback called before each retry */
  onRetry?: (attempt: number, error: Error, nextDelayMs: number) => void;
  /** Function to determine if error is retryable */
  shouldRetry?: (error: Error) => boolean;
  /** Context string for error messages */
  context?: string;
}

/**
 * Default retry options
 */
const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  jitterFactor: 0.3, // ±30% jitter
  onRetry: () => {},
  shouldRetry: isRetryableError,
  context: "Operation",
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number,
  jitterFactor: number
): number {
  const baseDelay = Math.min(
    initialDelay * Math.pow(backoffMultiplier, attempt - 1),
    maxDelay
  );
  const jitter = baseDelay * jitterFactor * (Math.random() * 2 - 1);
  return Math.max(0, baseDelay + jitter);
}

/**
 * Execute a function with retry logic and exponential backoff
 *
 * @param fn Function to execute
 * @param options Retry options
 * @returns Promise resolving to function result
 * @throws Last error if all retries fail, with context
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => fetchData(),
 *   {
 *     maxAttempts: 3,
 *     context: 'FetchData',
 *     onRetry: (attempt, error, delay) => {
 *       ErrorLogger.warn('FetchData', `Retry ${attempt} after ${delay}ms`, { error: error.message });
 *     }
 *   }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (!opts.shouldRetry(lastError)) {
        throw lastError;
      }

      // Don't delay after last attempt
      if (attempt >= opts.maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier,
        opts.jitterFactor
      );

      // Notify retry callback with delay info
      opts.onRetry(attempt, lastError, delay);

      // Wait before retrying
      await sleep(delay);
    }
  }

  // Enhance error message with context and attempt info
  const contextPrefix = opts.context ? `[${opts.context}] ` : "";
  const enhancedError = new Error(
    `${contextPrefix}Failed after ${opts.maxAttempts} attempts: ${lastError!.message}`
  );
  enhancedError.cause = lastError!;
  throw enhancedError;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a retry wrapper for a function
 *
 * @param fn Function to wrap
 * @param options Retry options
 * @returns Wrapped function with retry logic
 */
export function createRetryWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return ((...args: Parameters<T>) => {
    return withRetry(() => fn(...args), options);
  }) as T;
}
