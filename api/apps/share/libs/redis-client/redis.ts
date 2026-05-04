import { Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import Event from './events/event';
import { REDIS_SUBSCRIBE_NAME } from '@share/enums';
const logger = new Logger('Redis Client!');

/**
 * RedisClient wrapper.
 * @class
 */
class RedisClient {
  static instance: RedisClient;
  private redisClient: RedisClientType;

  /**
   * Create instance.
   * @constructor
   */
  constructor() {
    this.redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_SERVER_PORT as string),
      },
    });
    this.connect();
  }

  /**
   * Redis connect.
   */
  connect(): void {
    this.redisClient
      .connect()
      .then(() => logger.log('Connect was success!'))
      .catch((error) => logger.error(error.message));
  }

  /**
   * Redis publish.
   * @param {Event} - The event object.
   */
  publish(event: Event): void {
    this.redisClient
      .publish(event.eventName, event.plainToObject)
      .catch((error) => Logger.error('Redis publish error', error.message));
  }

  /**
   * Redis subscribe.
   * @param {string} - The event name.
   * @param {function} - The subscribe callback.
   */
  async subscribe(eventName: REDIS_SUBSCRIBE_NAME, fn: (args?: any) => void): Promise<void> {
    const subscriber = this.redisClient.duplicate();
    await subscriber.connect();
    subscriber.subscribe(eventName, fn).catch((error) => Logger.error('Redis subscribe error', error.message));
  }

  /**
   * Redis client object.
   */
  get Client(): RedisClientType {
    return this.redisClient;
  }

  /**
   * Redis instance.
   * @static
   */
  static get Instance(): RedisClient {
    if (!this.instance) {
      this.instance = new RedisClient();
    }
    return this.instance;
  }
}

export default RedisClient;
