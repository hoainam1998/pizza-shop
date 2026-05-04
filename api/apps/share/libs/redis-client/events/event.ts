import { REDIS_SUBSCRIBE_NAME } from '@share/enums';

type RedisDataJson = {
  senderId: string;
  payload: any;
};

/**
 * Redis event pub/sub
 * @class
 */
class Event {
  _eventName: REDIS_SUBSCRIBE_NAME;
  _payload: any;
  _senderId: string;

  /**
   * Create new RedisClient instance.
   * @constructor
   * @param {REDIS_SUBSCRIBE_NAME} eventName - The event name.
   * @param {object} payload - The redis subscribe payload.
   * @param {string} senderId - The senderId.
   */
  private constructor(eventName: REDIS_SUBSCRIBE_NAME, payload: any, senderId: string) {
    this._eventName = eventName;
    this._payload = JSON.stringify(payload);
    this._senderId = senderId;
  }

  get eventName() {
    return this._eventName;
  }

  get payload() {
    return this._payload;
  }

  get senderId() {
    return this._senderId;
  }

  get plainToObject() {
    return JSON.stringify({
      payload: this.payload,
      senderId: this._senderId,
    });
  }

  /**
   * Create new event.
   * @static
   * @param {REDIS_SUBSCRIBE_NAME} eventName - The event name.
   * @param {object} payload - The payload.
   * @param {string} senderId - The senderId.
   * @returns {Event} The new event.
   */
  static createEvent(eventName: REDIS_SUBSCRIBE_NAME, payload: any, senderId: string): Event {
    return new Event(eventName, payload, senderId);
  }

  /**
   * Return message object from json.
   * @static
   * @param {string} json - The json string.
   * @returns {{
   * senderId: string,
   * payload: object
   * }} The plain message object.
   */
  static fromJson(json: string): RedisDataJson {
    const messageObject = JSON.parse(json);
    const payload = JSON.parse(messageObject.payload as string);
    return {
      ...messageObject,
      payload,
    };
  }
}

export default Event;
