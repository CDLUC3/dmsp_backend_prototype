import pino, { Logger } from 'pino';
import {LoggerContext} from "../logger";

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

export function initLogger(baseLogger: Logger, contextFields: LoggerContext): Logger {
  return mockLogger;
}

export function prepareObjectForLogs(obj: object): object {
  return obj;
}
