import pino, { Logger } from 'pino';

// Mock a Pino Logger
const mockLogger = {
  level: jest.fn(),
  fatal: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
  child: jest.fn().mockReturnThis(),
} as unknown as pino.Logger;

export const logger = mockLogger;

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-invalid-void-type
export function formatLogMessage(logger: Logger, _args: object | void): Logger {
  return logger;
}
