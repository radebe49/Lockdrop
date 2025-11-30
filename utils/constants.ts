/**
 * Centralized application constants
 */

/**
 * Retry configuration for network operations
 */
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000, // 1 second
  MAX_DELAY: 30000, // 30 seconds
  BACKOFF_MULTIPLIER: 2,
  JITTER_FACTOR: 0.3, // ±30%
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
} as const;

/**
 * Interval timings (in milliseconds)
 */
export const INTERVALS = {
  HEALTH_CHECK: 30000, // 30 seconds
  STATUS_UPDATE: 10000, // 10 seconds
  NETWORK_CHECK: 30000, // 30 seconds
} as const;

/**
 * Storage limits
 */
export const STORAGE_LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_LOGS: 100,
} as const;

/**
 * Supported media types
 */
export const MEDIA_TYPES = {
  VIDEO: ["video/mp4", "video/webm", "video/quicktime"],
  AUDIO: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm"],
} as const;

/**
 * All supported media MIME types
 */
export const SUPPORTED_MEDIA_TYPES = [
  ...MEDIA_TYPES.VIDEO,
  ...MEDIA_TYPES.AUDIO,
] as const;
