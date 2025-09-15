import pino, { Logger } from 'pino';
import { ecsFormat } from '@elastic/ecs-pino-format';
import { isNullOrUndefined } from "./utils/helpers";

/*
 * Logger using Pino and the Elastic Common Schema format to facilitate
 * standardization across all log messaging. This format will allow us
 * to more easily debug and track requests in OpenSearch.
 *
 * The log messages will include a numeric `level` that corresponds to the log level.
 *    10 = trace, 20 = debug, 30 = info, 40 = debug, 50 = error, 60 = fatal
 */

const logLevel = process.env.LOG_LEVEL || 'info';

export const logger: Logger = pino({
  level: logLevel,
  redact: {
    paths: ['email', 'givenName', 'surName', 'password', 'pwd'],
    censor: '[MASKED]'
  },
  ...ecsFormat()
});

export interface LoggerContext {
  app: string;
  env: string;
  requestId?: string;
  jti?: string;
  userId?: number;
}

// Initialize the logger. Called by buildContext and in non-GraphQL controllers.
// Spawns an instance of the pino logger with the specified contextFields.
// The newly spawned instance is then used throughout the request's lifecycle
export function initLogger(baseLogger: Logger, contextFields: LoggerContext): Logger {
  try {
    return baseLogger.child(prepareObjectForLogs(contextFields));
  } catch (err) {
    console.error('Unable to initialize the logger', err);
    return baseLogger;
  }
}

// Filter out undefined fields for cleaner logs
export function prepareObjectForLogs(obj: object): object {
  return Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(obj).filter(([_, v]) => !isNullOrUndefined(v))
  );
}
