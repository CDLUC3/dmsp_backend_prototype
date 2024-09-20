import { Cache } from '../cache';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { KeyvAdapter } from '@apollo/utils.keyvadapter';
import { logger } from '../../__mocks__/logger';

jest.mock('ioredis');
jest.mock('keyv');
jest.mock('@keyv/redis');
jest.mock('@apollo/utils.keyvadapter');

describe('Cache', () => {
  let mockKeyvInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockKeyvInstance = { on: jest.fn() };

    // Mock KeyvAdapter and Keyv
    (KeyvAdapter as jest.Mock).mockImplementation(() => ({ }));
    (Keyv as jest.Mock).mockImplementation(() => mockKeyvInstance);
  });

  it('should create a Redis cluster and initialize KeyvAdapter', () => {
    Cache.getInstance();

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
    expect(logger.info).toHaveBeenCalledWith(null, 'Redis connection established');

    // Simulate connection error
    const errorCallback = mockKeyvInstance.on.mock.calls.find(call => call[0] === 'error')[1];
    errorCallback(mockError);
    expect(logger.error).toHaveBeenCalledWith(mockError, 'Redis connection error - Connection error');

    // Simulate connection closed
    const closeCallback = mockKeyvInstance.on.mock.calls.find(call => call[0] === 'close')[1];
    closeCallback();
    expect(logger.info).toHaveBeenCalledWith(null, 'Redis connection closed');
    Cache.removeInstance();
  });

  it('should follow the singleton pattern', () => {
    const instance1 = Cache.getInstance();
    const instance2 = Cache.getInstance();

    // Ensure that both instances are the same (singleton)
    expect(instance1).toBe(instance2);
    expect(Keyv).toHaveBeenCalledTimes(1);
    Cache.removeInstance();
  });
});
