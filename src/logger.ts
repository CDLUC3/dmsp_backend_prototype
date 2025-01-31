import pino, { Logger } from 'pino';
import { ecsFormat } from '@elastic/ecs-pino-format';
import { MyContext } from './context';

const logLevel = process.env.LOG_LEVEL || 'info';

/*
 * Logger using Pino and the Elastic Common Schema format to facilitate
 * standardization across all log messaging. This format will allow us
 * to more easily debug and track requests in OpenSearch.
 */
export const logger: Logger = pino({ level: logLevel, ...ecsFormat })

// Format a log message with information from the Apollo server context.
// Attaches the unique Request Id, and the user's JTI and UserId from the token.
//
// The message and any payload information can be included in the normal logger function.
//    For example:  `formatLogMessage(context).debug({ foo: bar }, 'My log message');
//
// The log messages will include a numeric `level` that corresponds to the log level.
//    For example: 10 = trace, 20 = debug, 30 = info, 40 = debug, 50 = error, 60 = fatal
//
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export function formatLogMessage(context: MyContext): Logger {
  const args = {
    requestId: context?.requestId,
    jti: context?.token?.jti,
    userId: context?.token?.id,
  }

  // Append the Apollo context args
  if (args.requestId || args.userId || args.jti) {
    return context.logger.child({ ...args });
  }

  // Otherwise there were no additional arfs, so return the logger as-is
  return context.logger;
}
