import { Cache } from '../cache';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import Redis from 'ioredis';
import { KeyvAdapter } from '@apollo/utils.keyvadapter';
import mockLogger from '../../__tests__/mockLogger';

// Mock Redis Cluster, Keyv, KeyvRedis, and KeyvAdapter
jest.mock('ioredis', () => ({
  Cluster: jest.fn(),
}));
jest.mock('keyv');
jest.mock('@keyv/redis');
jest.mock('@apollo/utils.keyvadapter');

describe('Cache', () => {
  let mockRedisCluster;
  let mockKeyvInstance;
  let logger;

  beforeEach(() => {
    jest.clearAllMocks();

    logger = mockLogger;

    mockRedisCluster = { on: jest.fn() };
    mockKeyvInstance = { on: jest.fn() };

    // Mock KeyvAdapter
    (KeyvAdapter as jest.Mock).mockImplementation(() => ({
      // Adapter functionality mock
    }));

    // Mock Redis and Keyv
    (Redis.Cluster as jest.Mock).mockImplementation(() => mockRedisCluster);
    (Keyv as jest.Mock).mockImplementation(() => mockKeyvInstance);
  });

  it('should create a Redis cluster and initialize KeyvAdapter', () => {
    Cache.getInstance();

    expect(Redis.Cluster).toHaveBeenCalledWith(expect.any(Array));
    expect(Keyv).toHaveBeenCalledWith(expect.any(KeyvRedis));
    expect(KeyvAdapter).toHaveBeenCalledWith(mockKeyvInstance);
    Cache.removeInstance();
  });

  it('should log when Redis connection is established, encounters an error, or is closed', () => {
    const mockError = new Error('Connection error');
    Cache.getInstance();

    // Simulate connection established
    const connectCallback = mockKeyvInstance.on.mock.calls.find(call => call[0] === 'connect')[1];
    connectCallback();
    expect(logger.error).toHaveBeenCalledWith(null, 'Redis connection established');

    // Simulate connection error
    const errorCallback = mockKeyvInstance.on.mock.calls.find(call => call[0] === 'error')[1];
    errorCallback(mockError);
    expect(logger.error).toHaveBeenCalledWith(mockError, 'Redis connection error');

    // Simulate connection closed
    const closeCallback = mockKeyvInstance.on.mock.calls.find(call => call[0] === 'close')[1];
    closeCallback();
    expect(logger.error).toHaveBeenCalledWith(null, 'Redis connection closed');
    Cache.removeInstance();
  });

  it('should follow the singleton pattern', () => {
    const instance1 = Cache.getInstance();
    const instance2 = Cache.getInstance();

    // Ensure that both instances are the same (singleton)
    expect(instance1).toBe(instance2);
    expect(Redis.Cluster).toHaveBeenCalledTimes(1);
    expect(Keyv).toHaveBeenCalledTimes(1);
    Cache.removeInstance();
  });
});
