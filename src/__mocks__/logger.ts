import pino, { Logger } from 'pino';
import { MyContext } from '../context';

const baseMockLogger = {
  level: jest.fn(),
  fatal: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
}

// Mock a Pino Logger
const mockLogger = {
  ...baseMockLogger,
  child() {
    return baseMockLogger;
  },
} as unknown as pino.Logger;

export const logger = mockLogger;

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-invalid-void-type
export function formatLogMessage(context: MyContext): Logger {
  return context.logger;
}
