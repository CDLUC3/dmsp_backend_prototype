import pino, { Logger } from 'pino';
import { ecsFormat } from '@elastic/ecs-pino-format';
import { MyContext } from './context';
import {generalConfig} from "./config/generalConfig";

const logLevel = process.env.LOG_LEVEL || 'info';

/*
 * Logger using Pino and the Elastic Common Schema format to facilitate
 * standardization across all log messaging. This format will allow us
 * to more easily debug and track requests in OpenSearch.
 */
export const logger: Logger = pino({ level: logLevel, ...ecsFormat() })

// Format a log message with information from the Apollo server context.
// Attaches the unique Request Id, and the user's JTI and UserId from the token.
//
// The message and any payload information can be included in the normal logger function.
//    For example:  `formatLogMessage(context).debug({ foo: bar }, 'My log message');
//
// The log messages will include a numeric `level` that corresponds to the log level.
//    For example: 10 = trace, 20 = debug, 30 = info, 40 = debug, 50 = error, 60 = fatal
//
export function formatLogMessage(context: MyContext): Logger {
  const contextFields = {
    app: generalConfig.applicationName,
    env: generalConfig.env,
    requestId: context?.requestId,
    jti: context?.token?.jti,
    userId: context?.token?.id,
  };

  // Filter out undefined fields for cleaner logs
  const metadata = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(contextFields).filter(([_, v]) => v !== undefined)
  );

  return logger.child(metadata);
}
