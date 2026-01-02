/**
 * Request Logging Utility
 * Provides structured logging for API requests and audit trail
 */

export interface LogEntry {
  timestamp: string;
  userId?: string;
  userEmail?: string;
  endpoint: string;
  method: string;
  status?: number;
  duration?: number;
  error?: string;
}

/**
 * Log an API request with user context
 */
export function logRequest(entry: LogEntry): void {
  const logMessage = [
    `[${entry.timestamp}]`,
    entry.method,
    entry.endpoint,
    entry.userId ? `| User: ${entry.userId}` : '',
    entry.userEmail ? `(${entry.userEmail})` : '',
    entry.status ? `| Status: ${entry.status}` : '',
    entry.duration ? `| ${entry.duration}ms` : '',
    entry.error ? `| Error: ${entry.error}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (entry.error || (entry.status && entry.status >= 400)) {
    console.error(logMessage);
  } else {
    console.log(logMessage);
  }
}

/**
 * Create a request logger for a specific endpoint
 */
export function createEndpointLogger(endpoint: string) {
  return {
    logRequest: (
      method: string,
      userId?: string,
      userEmail?: string,
      status?: number,
      duration?: number,
      error?: string
    ) => {
      logRequest({
        timestamp: new Date().toISOString(),
        endpoint,
        method,
        userId,
        userEmail,
        status,
        duration,
        error,
      });
    },
  };
}

/**
 * Log authentication attempt
 */
export function logAuth(
  type: 'login' | 'signup' | 'token-verify' | 'logout',
  email?: string,
  success: boolean = true,
  error?: string
): void {
  const emoji = success ? '✅' : '❌';
  const message = [
    emoji,
    type.toUpperCase(),
    email ? `| ${email}` : '',
    error ? `| Error: ${error}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (success) {
    console.log(message);
  } else {
    console.error(message);
  }
}

/**
 * Log security event (for monitoring suspicious activity)
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): void {
  const emoji = {
    low: '🔵',
    medium: '🟡',
    high: '🟠',
    critical: '🔴',
  }[severity];

  console.warn(`${emoji} SECURITY: ${event}`, details);

  // In production, you would send this to a security monitoring service
  // like Sentry, Datadog, or AWS CloudWatch
}

/**
 * Measure and log request duration
 */
export function measureDuration() {
  const start = Date.now();
  return () => Date.now() - start;
}

/**
 * Log API key usage (for cost tracking)
 */
export function logApiUsage(
  provider: 'gemini' | 'openai' | 'resend',
  operation: string,
  userId?: string,
  cost?: number
): void {
  console.log(`💰 API Usage | ${provider.toUpperCase()} | ${operation} | User: ${userId || 'unknown'}${cost ? ` | Est. Cost: $${cost.toFixed(4)}` : ''}`);
}

/**
 * Example usage in API endpoints:
 *
 * import { logRequest, logAuth, measureDuration } from '../utils/logger';
 *
 * // In API handler
 * const getDuration = measureDuration();
 *
 * // ... process request ...
 *
 * logRequest({
 *   timestamp: new Date().toISOString(),
 *   userId: req.userId,
 *   userEmail: req.userEmail,
 *   endpoint: '/api/analyze-call',
 *   method: 'POST',
 *   status: 200,
 *   duration: getDuration()
 * });
 */
