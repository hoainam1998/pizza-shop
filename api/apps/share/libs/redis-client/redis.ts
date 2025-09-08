import { Logger } from '@nestjs/common';
import { createClient } from 'redis';
import Event from './events/event';
const logger = new Logger('Redis Client!');

/**
 * RedisClient wrapper.
 * @class
 */
class RedisClient {
  static instance: RedisClient;
  redisClient;

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
  connect() {
    this.redisClient
      .connect()
      .then(() => logger.log('Connect was success!'))
      .catch((error) => logger.error(error));
  }

  /**
   * Redis publish.
   * @param {Event} - The event object.
   */
  publish(event: Event) {
    this.redisClient
      .publish(event.eventName, event.plainToObject)
      .catch((error) => Logger.log('Redis Pub', error.message));
  }

  /**
   * Redis subscribe.
   * @param {string} - The event name.
   * @param {function} - The subscribe callback.
   */
  async subscribe(eventName: string, fn: any) {
    const subscriber = this.redisClient.duplicate();
    await subscriber.connect();
    subscriber.subscribe(eventName, fn).catch((error) => Logger.log('Redis Sub', error.message));
  }

  /**
   * Redis client object.
   */
  get Client(): any {
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
