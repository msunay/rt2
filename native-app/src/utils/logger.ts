/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  namespace?: string;
}

/**
 * Default logger configuration
 */
const defaultConfig: LoggerConfig = {
  minLevel: LogLevel.INFO,
  enableConsole: true
};

/**
 * Map of log level to console function
 */
const logLevelMap: Record<LogLevel, keyof Console> = {
  [LogLevel.DEBUG]: 'debug',
  [LogLevel.INFO]: 'log',
  [LogLevel.WARN]: 'warn',
  [LogLevel.ERROR]: 'error'
};

/**
 * Log level priorities (higher number = higher priority)
 */
const logLevelPriority: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3
};

/**
 * Logger class
 */
export class Logger {
  private config: LoggerConfig;

  /**
   * Creates a new logger
   * @param namespace Optional namespace for the logger
   * @param config Optional logger configuration
   */
  constructor(namespace?: string, config: Partial<LoggerConfig> = {}) {
    this.config = {
      ...defaultConfig,
      ...config,
      namespace
    };
  }

  /**
   * Logs a message at the specified level
   * @param level Log level
   * @param message Log message
   * @param data Additional data to log
   */
  private log(level: LogLevel, message: string, ...data: any[]): void {
    // Check if we should log this message based on level
    if (logLevelPriority[level] < logLevelPriority[this.config.minLevel]) {
      return;
    }

    // Format message with namespace if it exists
    const formattedMessage = this.config.namespace
      ? `[${this.config.namespace}] ${message}`
      : message;

    // Log to console if enabled
    if (this.config.enableConsole) {
      const consoleMethod = logLevelMap[level];
      if (data.length > 0) {
        (console[consoleMethod] as Function)(formattedMessage, ...data);
      } else {
        (console[consoleMethod] as Function)(formattedMessage);
      }
    }

    // Additional log targets could be added here (e.g., file, remote logging)
  }

  /**
   * Logs a debug message
   * @param message Log message
   * @param data Additional data to log
   */
  public debug(message: string, ...data: any[]): void {
    this.log(LogLevel.DEBUG, message, ...data);
  }

  /**
   * Logs an info message
   * @param message Log message
   * @param data Additional data to log
   */
  public info(message: string, ...data: any[]): void {
    this.log(LogLevel.INFO, message, ...data);
  }

  /**
   * Logs a warning message
   * @param message Log message
   * @param data Additional data to log
   */
  public warn(message: string, ...data: any[]): void {
    this.log(LogLevel.WARN, message, ...data);
  }

  /**
   * Logs an error message
   * @param message Log message
   * @param error Optional error object
   * @param data Additional data to log
   */
  public error(message: string, error?: Error | unknown, ...data: any[]): void {
    if (error instanceof Error) {
      this.log(LogLevel.ERROR, `${message}: ${error.message}`, error.stack, ...data);
    } else if (error !== undefined) {
      this.log(LogLevel.ERROR, message, error, ...data);
    } else {
      this.log(LogLevel.ERROR, message, ...data);
    }
  }

  /**
   * Creates a new logger with a child namespace
   * @param childNamespace Child namespace
   * @returns A new logger instance with the child namespace
   */
  public child(childNamespace: string): Logger {
    const parentNamespace = this.config.namespace;
    const combinedNamespace = parentNamespace
      ? `${parentNamespace}:${childNamespace}`
      : childNamespace;

    return new Logger(combinedNamespace, this.config);
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger('app');

/**
 * WebSocket logger instance
 */
export const wsLogger = logger.child('websocket');

/**
 * MediaSoup logger instance
 */
export const mediaLogger = logger.child('media');

/**
 * Quiz logger instance
 */
export const quizLogger = logger.child('quiz');