import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENT_NAME } from './enums';

/**
 * Socket service class.
 * @class
 */
export default class SocketService {
  private static socket: SocketService = new SocketService();
  private _io: Socket;

  constructor() {
    this._io = io(process.env.BASE_URL);
    this._io.on('connect', () => {
      this._io.emit('connected', { userId: '1764900213623' });
    });
  }

  /**
   * The subscribe event helper.
   * @param {SOCKET_EVENT_NAME} eventName - The socket event name.
   * @param {() => void} callback - The callback event.
   */
  static subscribe(eventName: SOCKET_EVENT_NAME, callback: () => void): void {
    this.socket._io.on(eventName, callback);
  }

  /**
   * The unsubscribe event helper.
   * @param {SOCKET_EVENT_NAME} eventName - The socket event name.
   */
  static unsubscribe(eventName: SOCKET_EVENT_NAME): void {
    this.socket._io.removeAllListeners(eventName);
  }

  /**
   * Emit event helper.
   * @param {SOCKET_EVENT_NAME} eventName - The socket event name.
   * @param {*} payload - The payload data.
   */
  static emit(eventName: SOCKET_EVENT_NAME, payload: any): void {
    this.socket._io.emit(eventName, payload);
  }
}
