/**
 * ErrorLogger - Centralized error logging and monitoring
 *
 * Provides structured error logging with context, categorization,
 * and integration points for monitoring services.
 *
 * Features:
 * - Multiple log levels (debug, info, warn, error)
 * - Log level filtering based on environment
 * - Structured log entries with context
 * - In-memory log storage with size limits
 * - Statistics and export capabilities
 */

import {
  ErrorCategory,
  ErrorSeverity,
  classifyError,
} from "@/utils/errorHandling";

/**
 * Log levels for filtering
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Error log entry
 */
export interface ErrorLogEntry {
  timestamp: number;
  level: LogLevel;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  technicalMessage: string;
  context: string;
  userAddress?: string;
  stackTrace?: string;
  additionalData?: Record<string, unknown>;
}

/**
 * Simple log entry for info/debug messages
 */
export interface SimpleLogEntry {
  timestamp: number;
  level: LogLevel;
  context: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * ErrorLogger provides centralized logging with context and filtering
 */
export class ErrorLogger {
  private static errorLogs: ErrorLogEntry[] = [];
  private static simpleLogs: SimpleLogEntry[] = [];
  private static maxLogs = 100; // Keep last 100 entries per type

  /**
   * Current log level - only logs at or above this level are output
   * In production, defaults to WARN; in development, defaults to DEBUG
   */
  private static currentLevel: LogLevel =
    process.env.NODE_ENV === "production" ? LogLevel.WARN : LogLevel.DEBUG;

  /**
   * Set the minimum log level
   */
  static setLogLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * Get the current log level
   */
  static getLogLevel(): LogLevel {
    return this.currentLevel;
  }

  /**
   * Check if a log level should be output
   */
  private static shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  /**
   * Log a debug message (development only by default)
   */
  static debug(
    context: string,
    message: string,
    data?: Record<string, unknown>
  ): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry: SimpleLogEntry = {
      timestamp: Date.now(),
      level: LogLevel.DEBUG,
      context,
      message,
      data,
    };

    this.addSimpleLog(entry);
    console.debug(`[${context}]`, message, data ?? "");
  }

  /**
   * Log an info message
   */
  static info(
    context: string,
    message: string,
    data?: Record<string, unknown>
  ): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry: SimpleLogEntry = {
      timestamp: Date.now(),
      level: LogLevel.INFO,
      context,
      message,
      data,
    };

    this.addSimpleLog(entry);
    console.info(`[${context}]`, message, data ?? "");
  }

  /**
   * Log a warning message
   */
  static warn(
    context: string,
    message: string,
    data?: Record<string, unknown>
  ): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry: SimpleLogEntry = {
      timestamp: Date.now(),
      level: LogLevel.WARN,
      context,
      message,
      data,
    };

    this.addSimpleLog(entry);
    console.warn(`[${context}]`, message, data ?? "");
  }

  /**
   * Add a simple log entry with size management
   */
  private static addSimpleLog(entry: SimpleLogEntry): void {
    this.simpleLogs.push(entry);
    if (this.simpleLogs.length > this.maxLogs) {
      this.simpleLogs = this.simpleLogs.slice(-this.maxLogs);
    }
  }

  /**
   * Log an error with context (always logged regardless of level)
   *
   * @param error The error to log
   * @param context Context where the error occurred
   * @param additionalData Additional data to include
   */
  static log(
    error: Error | string,
    context: string,
    additionalData?: Record<string, unknown>
  ): void {
    this.error(error, context, additionalData);
  }

  /**
   * Log an error with context
   *
   * @param error The error to log
   * @param context Context where the error occurred
   * @param additionalData Additional data to include
   */
  static error(
    error: Error | string,
    context: string,
    additionalData?: Record<string, unknown>
  ): void {
    const errorInfo = classifyError(error);
    const errorObj = typeof error === "string" ? new Error(error) : error;

    const entry: ErrorLogEntry = {
      timestamp: Date.now(),
      level: LogLevel.ERROR,
      category: errorInfo.category,
      severity: errorInfo.severity,
      message: errorInfo.message,
      technicalMessage: errorInfo.technicalMessage,
      context,
      stackTrace: errorObj.stack,
      additionalData,
    };

    // Add to in-memory log
    this.errorLogs.push(entry);

    // Keep only last maxLogs entries
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(-this.maxLogs);
    }

    // Console logging based on severity
    const logMethod = this.getConsoleMethod(errorInfo.severity);
    logMethod(
      `[${context}] ${errorInfo.category.toUpperCase()}:`,
      errorInfo.message,
      additionalData ?? ""
    );

    // In production, send to monitoring service
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoring(entry);
    }
  }

  /**
   * Get appropriate console method for severity
   */
  private static getConsoleMethod(severity: ErrorSeverity): typeof console.log {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.ERROR:
        return console.error;
      case ErrorSeverity.WARNING:
        return console.warn;
      case ErrorSeverity.INFO:
      default:
        return console.info;
    }
  }

  /**
   * Send error to monitoring service (placeholder)
   *
   * In production, integrate with services like:
   * - Sentry
   * - LogRocket
   * - Datadog
   * - Custom logging endpoint
   */
  private static sendToMonitoring(_entry: ErrorLogEntry): void {
    // Placeholder for monitoring service integration
    // Example: Sentry.captureException(_entry);
  }

  /**
   * Get recent error logs
   */
  static getRecentLogs(count: number = 10): ErrorLogEntry[] {
    return this.errorLogs.slice(-count);
  }

  /**
   * Get recent simple logs (info/debug/warn)
   */
  static getRecentSimpleLogs(count: number = 10): SimpleLogEntry[] {
    return this.simpleLogs.slice(-count);
  }

  /**
   * Get all recent logs combined and sorted by timestamp
   */
  static getAllRecentLogs(
    count: number = 20
  ): (ErrorLogEntry | SimpleLogEntry)[] {
    const combined = [
      ...this.errorLogs.map((e) => ({ ...e, _type: "error" as const })),
      ...this.simpleLogs.map((s) => ({ ...s, _type: "simple" as const })),
    ];
    return combined
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count)
      .map(({ _type, ...rest }) => rest as ErrorLogEntry | SimpleLogEntry);
  }

  /**
   * Get logs by category
   */
  static getLogsByCategory(category: ErrorCategory): ErrorLogEntry[] {
    return this.errorLogs.filter((log) => log.category === category);
  }

  /**
   * Get logs by severity
   */
  static getLogsBySeverity(severity: ErrorSeverity): ErrorLogEntry[] {
    return this.errorLogs.filter((log) => log.severity === severity);
  }

  /**
   * Get logs by level
   */
  static getLogsByLevel(level: LogLevel): SimpleLogEntry[] {
    return this.simpleLogs.filter((log) => log.level === level);
  }

  /**
   * Clear all logs
   */
  static clearLogs(): void {
    this.errorLogs = [];
    this.simpleLogs = [];
  }

  /**
   * Export logs as JSON
   */
  static exportLogs(): string {
    return JSON.stringify(
      {
        errors: this.errorLogs,
        logs: this.simpleLogs,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  /**
   * Get error statistics
   */
  static getStatistics(): {
    total: number;
    errors: number;
    warnings: number;
    info: number;
    debug: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
  } {
    const stats = {
      total: this.errorLogs.length + this.simpleLogs.length,
      errors: this.errorLogs.length,
      warnings: this.simpleLogs.filter((l) => l.level === LogLevel.WARN).length,
      info: this.simpleLogs.filter((l) => l.level === LogLevel.INFO).length,
      debug: this.simpleLogs.filter((l) => l.level === LogLevel.DEBUG).length,
      byCategory: {} as Record<ErrorCategory, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
    };

    // Initialize counters
    Object.values(ErrorCategory).forEach((cat) => {
      stats.byCategory[cat] = 0;
    });
    Object.values(ErrorSeverity).forEach((sev) => {
      stats.bySeverity[sev] = 0;
    });

    // Count occurrences
    this.errorLogs.forEach((log) => {
      stats.byCategory[log.category]++;
      stats.bySeverity[log.severity]++;
    });

    return stats;
  }
}
