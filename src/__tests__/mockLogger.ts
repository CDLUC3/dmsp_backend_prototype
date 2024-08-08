import pino from 'pino';

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

export default mockLogger;
