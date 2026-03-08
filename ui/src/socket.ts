import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENT_NAME } from './enums';

/**
 * Socket service class.
 * @class
 */
export default class SocketService {
  private static socket: SocketService;
  private _io: Socket;

  constructor() {
    this._io = io(process.env.SOCKET_URL);
    this._io.on('connect', () => {
      this._io.emit('connected', { userId: '1764900213623', view: isSale ? 'client' : 'admin' });
    });
  }

  /**
   * Create socket service.
   * @returns {SocketService} - The socket service.
   */
  static create() {
    if (!SocketService.socket) {
      SocketService.socket = new SocketService();
    }
    return SocketService.socket;
  }

  /**
   * The subscribe event helper.
   * @param {SOCKET_EVENT_NAME} eventName - The socket event name.
   * @param {(payload: any) => void} callback - The callback event.
   */
  static subscribe(eventName: SOCKET_EVENT_NAME, callback: (payload: any) => void): void {
    this.create()._io.on(eventName, callback);
  }

  /**
   * The unsubscribe event helper.
   * @param {SOCKET_EVENT_NAME} eventName - The socket event name.
   */
  static unsubscribe(eventName: SOCKET_EVENT_NAME): void {
    this.create()._io.removeAllListeners(eventName);
  }

  /**
   * Emit event helper.
   * @param {SOCKET_EVENT_NAME} eventName - The socket event name.
   * @param {*} payload - The payload data.
   */
  static emit(eventName: SOCKET_EVENT_NAME, payload: any): void {
    this.create()._io.emit(eventName, payload);
  }

  /**
   * Ws disconnect.
   */
  static disconnect(): void {
    this.create()._io.disconnect();
  }
}
