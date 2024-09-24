import Keyv from "keyv";
import KeyvRedis from "@keyv/redis";
import Redis from "ioredis";
import { KeyvAdapter } from "@apollo/utils.keyvadapter";
import { cacheConfig, cacheTLS } from "../config/cacheConfig";
import { logger, formatLogMessage } from '../logger';

export class Cache {
  private static instance: Cache;
  public adapter: KeyvAdapter;

  private constructor() {
    // Setup the Redis Cluster
    let cache;
    if (process.env.NODE_ENV !== 'development') {
      console.log('Connecting to local Redis');
      cache = new Redis(cacheConfig);
    } else {
      console.log(`Using TLS to connect to Redis - ${cacheTLS}`);
      // The AWS env uses TLS
      cache = new Redis(cacheTLS);
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
    this.adapter = new KeyvAdapter(keyV);
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
