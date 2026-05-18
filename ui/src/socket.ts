import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENT_NAME } from './enums';
import { auth as authStore } from '@/store';

type Subscriber = {
  name: SOCKET_EVENT_NAME;
  callback: (payload: any) => void;
};

const createSubscriber = (
  name: SOCKET_EVENT_NAME,
  callback: Subscriber['callback'],
): Subscriber => ({ name, callback });

/**
 * Socket service class.
 * @class
 */
export default class SocketService {
  private static _io: Socket | null;
  private static subscribers: Subscriber[] = [];

  /**
   * Socket connect.
   */
  static connect(): void {
    if (!this._io?.connected) {
      this._io = io(process.env.SOCKET_URL, {
        reconnection: false,
        auth: { token: authStore.getApiKey() },
      });

      this._io.on('connect', () => {
        while (this.subscribers.length) {
          const subscriber = this.subscribers.shift();
          if (subscriber) {
            this._io?.on(subscriber?.name, subscriber?.callback);
          }
        }
      });

      this._io.on('connect_error', (err) => {
        this.disconnect();
        console.warn(`[Socket] ${err.message}`);
      });
    }
  }

  /**
   * The subscribe event helper.
   * @param {SOCKET_EVENT_NAME} eventName - The socket event name.
   * @param {(payload: any) => void} callback - The callback event.
   */
  static subscribe(eventName: SOCKET_EVENT_NAME, callback: (payload: any) => void): void {
    if (this._io?.connected) {
      this._io?.on(eventName, callback);
    } else {
      this.subscribers.push(createSubscriber(eventName, callback));
    }
  }

  /**
   * The unsubscribe event helper.
   * @param {SOCKET_EVENT_NAME} eventName - The socket event name.
   */
  static unsubscribe(eventName: SOCKET_EVENT_NAME): void {
    if (this._io?.connected) {
      this._io.removeAllListeners(eventName);
    }
  }

  /**
   * Emit event helper.
   * @param {SOCKET_EVENT_NAME} eventName - The socket event name.
   * @param {*} payload - The payload data.
   */
  static emit(eventName: SOCKET_EVENT_NAME, payload?: any): void {
    if (this._io?.connected) {
      this._io.emit(eventName, payload);
    }
  }

  /**
   * Ws disconnect.
   */
  static disconnect(): void {
    if (this._io?.connected) {
      this._io.disconnect();
      this._io = null;
    }
  }
}
