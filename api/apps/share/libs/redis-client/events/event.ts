type RedisDataJson = {
  senderId: string;
  payload: any;
};

/**
 * Redis event pub/sub
 * @class
 */
class Event {
  _eventName: string;
  _payload: any;
  _senderId: string;

  /**
   * Create new RedisClient instance.
   * @constructor
   * @param {string} eventName - The event name.
   * @param {object} payload - The redis subscribe payload.
   * @param {string} senderId - The senderId.
   */
  constructor(eventName: string, payload: any, senderId: string) {
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
   * @param {object} payload - The payload.
   * @param {string} senderId - The senderId.
   * @returns {Event} The new event.
   */
  static createEvent(payload: any, senderId: string): Event {
    return new Event((this as any).eventName, payload, senderId);
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
