/**
 * Error Path Tests
 *
 * Comprehensive tests for error handling, retry scenarios,
 * timeout handling, and network failure recovery.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { withRetry, RetryOptions } from "../utils/retry";
import { withTimeout } from "../utils/timeout";
import { isRetryableError } from "../utils/errorHandling";
import { AppError, ErrorCode, toAppError } from "../types/errors";

describe("Error Path Tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("Retry Logic with Different Error Types", () => {
    it("retries on network timeout errors", async () => {
      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error("ETIMEDOUT: connection timed out");
        }
        return "success";
      });

      const promise = withRetry(mockFn, {
        maxAttempts: 3,
        initialDelay: 100,
        jitterFactor: 0,
      });

      // Fast-forward through retries
      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(200);

      const result = await promise;
      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it("retries on connection refused errors", async () => {
      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error("ECONNREFUSED: connection refused");
        }
        return "success";
      });

      const promise = withRetry(mockFn, {
        maxAttempts: 3,
        initialDelay: 100,
        jitterFactor: 0,
      });

      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;
      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("retries on 503 Service Unavailable", async () => {
      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error("503 Service Unavailable");
        }
        return "success";
      });

      const promise = withRetry(mockFn, {
        maxAttempts: 3,
        initialDelay: 100,
        jitterFactor: 0,
      });

      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;
      expect(result).toBe("success");
    });

    it("retries on 429 Rate Limit errors", async () => {
      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error("429 Too Many Requests");
        }
        return "success";
      });

      const promise = withRetry(mockFn, {
        maxAttempts: 3,
        initialDelay: 100,
        jitterFactor: 0,
      });

      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;
      expect(result).toBe("success");
    });

    it("does NOT retry on 400 Bad Request", async () => {
      const mockFn = vi.fn(async () => {
        throw new Error("400 Bad Request: invalid parameters");
      });

      await expect(
        withRetry(mockFn, { maxAttempts: 3, initialDelay: 100 })
      ).rejects.toThrow("400 Bad Request");

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("does NOT retry on validation errors with 'invalid' keyword", async () => {
      const mockFn = vi.fn(async () => {
        throw new Error("Invalid recipient address");
      });

      await expect(
        withRetry(mockFn, { maxAttempts: 3, initialDelay: 100 })
      ).rejects.toThrow("Invalid recipient");

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("does NOT retry on required field errors", async () => {
      const mockFn = vi.fn(async () => {
        throw new Error("Field is required");
      });

      await expect(
        withRetry(mockFn, { maxAttempts: 3, initialDelay: 100 })
      ).rejects.toThrow("required");

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("does NOT retry on validation errors", async () => {
      const mockFn = vi.fn(async () => {
        throw new Error("Invalid address format");
      });

      await expect(
        withRetry(mockFn, { maxAttempts: 3, initialDelay: 100 })
      ).rejects.toThrow("Invalid address");

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("Exponential Backoff", () => {
    it("increases delay exponentially between retries", async () => {
      const delays: number[] = [];
      let lastTime = Date.now();
      let attempts = 0;

      const mockFn = vi.fn(async () => {
        const now = Date.now();
        if (attempts > 0) {
          delays.push(now - lastTime);
        }
        lastTime = now;
        attempts++;
        if (attempts < 4) {
          throw new Error("Network error");
        }
        return "success";
      });

      const promise = withRetry(mockFn, {
        maxAttempts: 4,
        initialDelay: 100,
        backoffMultiplier: 2,
        jitterFactor: 0,
      });

      // Advance through each retry
      await vi.advanceTimersByTimeAsync(100); // First retry
      await vi.advanceTimersByTimeAsync(200); // Second retry
      await vi.advanceTimersByTimeAsync(400); // Third retry

      await promise;

      expect(delays).toHaveLength(3);
      expect(delays[0]).toBe(100);
      expect(delays[1]).toBe(200);
      expect(delays[2]).toBe(400);
    });

    it("respects maxDelay cap", async () => {
      const delays: number[] = [];
      let lastTime = Date.now();
      let attempts = 0;

      const mockFn = vi.fn(async () => {
        const now = Date.now();
        if (attempts > 0) {
          delays.push(now - lastTime);
        }
        lastTime = now;
        attempts++;
        if (attempts < 5) {
          throw new Error("Network error");
        }
        return "success";
      });

      const promise = withRetry(mockFn, {
        maxAttempts: 5,
        initialDelay: 100,
        maxDelay: 300,
        backoffMultiplier: 2,
        jitterFactor: 0,
      });

      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(200);
      await vi.advanceTimersByTimeAsync(300);
      await vi.advanceTimersByTimeAsync(300);

      await promise;

      expect(delays[2]).toBe(300); // Capped at maxDelay
      expect(delays[3]).toBe(300); // Still capped
    });
  });

  describe("Retry Callbacks", () => {
    it("calls onRetry with correct parameters", async () => {
      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error("Network timeout");
        }
        return "success";
      });

      const onRetry = vi.fn();

      const promise = withRetry(mockFn, {
        maxAttempts: 3,
        initialDelay: 100,
        jitterFactor: 0,
        onRetry,
      });

      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(200);

      await promise;

      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenNthCalledWith(
        1,
        1,
        expect.any(Error),
        100
      );
      expect(onRetry).toHaveBeenNthCalledWith(
        2,
        2,
        expect.any(Error),
        200
      );
    });

    it("includes context in error message on final failure", async () => {
      const mockFn = vi.fn(async () => {
        throw new Error("Network error");
      });

      const promise = withRetry(mockFn, {
        maxAttempts: 2,
        initialDelay: 100,
        jitterFactor: 0,
        context: "StorachaUpload",
      });

      // Attach error handler to prevent unhandled rejection warning
      promise.catch(() => {});

      await vi.advanceTimersByTimeAsync(100);

      await expect(promise).rejects.toThrow("[StorachaUpload]");
    });
  });

  describe("Custom shouldRetry Function", () => {
    it("uses custom shouldRetry to determine retryability", async () => {
      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        throw new Error(attempts < 2 ? "RETRY_ME" : "DONT_RETRY");
      });

      const shouldRetry = vi.fn((error: Error) => {
        return error.message === "RETRY_ME";
      });

      const promise = withRetry(mockFn, {
        maxAttempts: 5,
        initialDelay: 100,
        jitterFactor: 0,
        shouldRetry,
      });

      // Attach error handler to prevent unhandled rejection warning
      promise.catch(() => {});

      await vi.advanceTimersByTimeAsync(100);

      await expect(promise).rejects.toThrow("DONT_RETRY");
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(shouldRetry).toHaveBeenCalledTimes(2);
    });
  });

  describe("Timeout Handling", () => {
    it("throws timeout error when operation exceeds limit", async () => {
      const slowOperation = new Promise((resolve) => {
        setTimeout(() => resolve("done"), 5000);
      });

      const promise = withTimeout(slowOperation, 1000, "Slow operation");

      // Attach error handler to prevent unhandled rejection warning
      promise.catch(() => {});

      await vi.advanceTimersByTimeAsync(1000);

      await expect(promise).rejects.toThrow("timed out");
    });

    it("resolves successfully when operation completes in time", async () => {
      const fastOperation = new Promise((resolve) => {
        setTimeout(() => resolve("done"), 500);
      });

      const promise = withTimeout(fastOperation, 1000, "Fast operation");

      await vi.advanceTimersByTimeAsync(500);

      const result = await promise;
      expect(result).toBe("done");
    });

    it("includes operation name in timeout error", async () => {
      const slowOperation = new Promise((resolve) => {
        setTimeout(() => resolve("done"), 5000);
      });

      const promise = withTimeout(slowOperation, 100, "IPFS upload");

      // Attach error handler to prevent unhandled rejection warning
      promise.catch(() => {});

      await vi.advanceTimersByTimeAsync(100);

      await expect(promise).rejects.toThrow("IPFS upload");
    });
  });

  describe("Error Classification", () => {
    it("classifies network errors as retryable", () => {
      const networkErrors = [
        new Error("Network timeout"),
        new Error("Connection refused"),
        new Error("fetch failed"),
        new Error("Connection reset"),
      ];

      networkErrors.forEach((error) => {
        expect(isRetryableError(error)).toBe(true);
      });
    });

    it("classifies validation errors as non-retryable", () => {
      // Based on classifyError logic: "invalid", "required", "validation" keywords
      const validationErrors = [
        new Error("Invalid address format"),
        new Error("Field is required"),
        new Error("Validation failed: missing data"),
      ];

      validationErrors.forEach((error) => {
        expect(isRetryableError(error)).toBe(false);
      });
    });

    it("classifies unlock/timestamp errors as non-retryable", () => {
      // Based on classifyError logic: "timestamp", "locked", "unlock" keywords
      const unlockErrors = [
        new Error("Message is still locked"),
        new Error("Unlock timestamp not reached"),
      ];

      unlockErrors.forEach((error) => {
        expect(isRetryableError(error)).toBe(false);
      });
    });
  });

  describe("AppError", () => {
    it("creates error with correct code and message", () => {
      const error = new AppError(ErrorCode.NETWORK_TIMEOUT);

      expect(error.code).toBe(ErrorCode.NETWORK_TIMEOUT);
      expect(error.message).toContain("timed out");
      expect(error.recovery).toContain("check your internet");
    });

    it("includes cause error", () => {
      const cause = new Error("Original error");
      const error = new AppError(ErrorCode.STORAGE_UPLOAD_FAILED, cause);

      expect(error.cause).toBe(cause);
    });

    it("allows custom message", () => {
      const error = new AppError(
        ErrorCode.UNKNOWN_ERROR,
        undefined,
        "Custom error message"
      );

      expect(error.message).toBe("Custom error message");
    });

    it("generates user-friendly message", () => {
      const error = new AppError(ErrorCode.WALLET_NOT_FOUND);
      const userMessage = error.toUserMessage();

      expect(userMessage).toContain("No compatible wallet");
      expect(userMessage).toContain("install Talisman");
    });
  });

  describe("toAppError Conversion", () => {
    it("returns existing AppError unchanged", () => {
      const original = new AppError(ErrorCode.AUTH_FAILED);
      const converted = toAppError(original);

      expect(converted).toBe(original);
    });

    it("converts timeout errors", () => {
      const error = new Error("Network timeout occurred");
      const converted = toAppError(error);

      expect(converted.code).toBe(ErrorCode.NETWORK_TIMEOUT);
    });

    it("converts network errors", () => {
      const error = new Error("fetch failed: network unavailable");
      const converted = toAppError(error);

      expect(converted.code).toBe(ErrorCode.NETWORK_UNAVAILABLE);
    });

    it("converts connection refused errors", () => {
      const error = new Error("ECONNREFUSED: connection refused");
      const converted = toAppError(error);

      expect(converted.code).toBe(ErrorCode.CONNECTION_REFUSED);
    });

    it("converts wallet not found errors", () => {
      const error = new Error("Wallet not found");
      const converted = toAppError(error);

      expect(converted.code).toBe(ErrorCode.WALLET_NOT_FOUND);
    });

    it("converts locked wallet errors", () => {
      const error = new Error("Wallet is locked");
      const converted = toAppError(error);

      expect(converted.code).toBe(ErrorCode.WALLET_LOCKED);
    });

    it("uses default code for unknown errors", () => {
      const error = new Error("Something weird happened");
      const converted = toAppError(error);

      expect(converted.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });

    it("uses custom default code", () => {
      const error = new Error("Something weird happened");
      const converted = toAppError(error, ErrorCode.STORAGE_UPLOAD_FAILED);

      expect(converted.code).toBe(ErrorCode.STORAGE_UPLOAD_FAILED);
    });

    it("handles string errors", () => {
      const converted = toAppError("String error message");

      expect(converted).toBeInstanceOf(AppError);
      expect(converted.cause?.message).toBe("String error message");
    });
  });

  describe("Network Disconnection During Operation", () => {
    it("handles disconnection mid-retry", async () => {
      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        // Simulate network coming back on third attempt
        if (attempts < 3) {
          throw new Error("Network unavailable");
        }
        return "recovered";
      });

      const promise = withRetry(mockFn, {
        maxAttempts: 5,
        initialDelay: 100,
        jitterFactor: 0,
      });

      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(200);

      const result = await promise;
      expect(result).toBe("recovered");
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });

  describe("Concurrent Retry Operations", () => {
    it("handles multiple concurrent retries independently", async () => {
      let op1Attempts = 0;
      let op2Attempts = 0;

      const op1 = vi.fn(async () => {
        op1Attempts++;
        if (op1Attempts < 2) throw new Error("Network error");
        return "op1-success";
      });

      const op2 = vi.fn(async () => {
        op2Attempts++;
        if (op2Attempts < 3) throw new Error("Network error");
        return "op2-success";
      });

      const promise1 = withRetry(op1, {
        maxAttempts: 3,
        initialDelay: 100,
        jitterFactor: 0,
      });

      const promise2 = withRetry(op2, {
        maxAttempts: 3,
        initialDelay: 100,
        jitterFactor: 0,
      });

      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(200);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe("op1-success");
      expect(result2).toBe("op2-success");
      expect(op1).toHaveBeenCalledTimes(2);
      expect(op2).toHaveBeenCalledTimes(3);
    });
  });
});
