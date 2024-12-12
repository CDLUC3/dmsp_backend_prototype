import Keyv from "keyv";
import KeyvRedis from "@keyv/redis";
import Redis from "ioredis";
import { KeyvAdapter } from "@apollo/utils.keyvadapter";
import { autoFailoverEnabled, cacheConfig, connectTimeout } from "../config/cacheConfig";
import { logger, formatLogMessage } from '../logger';

// Note that Redis cache clusters require you to wrap keys in `{}` to ensure that they are stored
// near one another and are able to be set and fetched.
//    For example: `{csrf}:12345` instead of `csrf:12345`
export class Cache {
  private static instance: Cache;
  public adapter: KeyvAdapter;

  private constructor() {
    let cache;

console.log(Redis)

    // Setup the Redis Cluster
    formatLogMessage(logger).info(cacheConfig, 'Attempting to connect to Redis');

    if (['development', 'test'].includes(process.env.NODE_ENV)) {
      // We are running locally, so use we are dealing with a single Redis node
      cache = new Redis({ ...cacheConfig, connectTimeout });

    } else {
      // We are running in the AW environment with an Elasticache
      if (autoFailoverEnabled === 'true') {
        // ElastiCache instances with Auto-failover enabled, reconnectOnError does not execute.
        // Instead of returning a Redis error, AWS closes all connections to the master endpoint
        // until the new primary node is ready. ioredis reconnects via retryStrategy instead of
        // reconnectOnError after about a minute.
        cache = new Redis({ ...cacheConfig, tls: {} });

      } else {
        // ElastiCache instances with Auto-failover disabled, reconnectOnError can be used to catch
        // the error READONLY thrown and force the connection to be restablished.
        cache = new Redis({
          ...cacheConfig,
          tls: {},
          reconnectOnError(err) {
            logger.error(err, 'Redis reconnect on error')
            const targetErrors = ["READONLY", "MOVED"];
            if (targetErrors.includes(err.message)) {
              // Only reconnect when the error contains "READONLY"
              return true; // or `return 1;`
            }
          },
        });
      }
    }

    // Having trouble figuring how how to type `Keyv` as `Keyv<string, Record<string, any>>`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keyV = new Keyv(new KeyvRedis(cache)) as any;

    keyV.on('connect', () => {
      formatLogMessage(logger).info(null, `Redis connection established`);
    });

    keyV.on('error', (err) => {
      formatLogMessage(logger).error(err, `Redis connection error - ${err.message}`);
    });

    keyV.on('close', () => {
      formatLogMessage(logger).info( null, `Redis connection closed`);
    });

    // Set the Adapter which will be used to interact with the cache
    this.adapter = new KeyvAdapter(keyV, { disableBatchReads: true });
  }

  // Singleton instance of the Cache
  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  // Remove the instance
  public static async removeInstance(): Promise<void> {
    if (Cache.instance) {
      Cache.instance = null;
    }
  }
}
