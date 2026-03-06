import { Socket } from 'socket.io';
import type { ConnectedPayloadType } from '@share/interfaces';
import { VIEW } from '@share/enums';
import SocketInstancesStorage from './socket-instances-storage';

/**
 * Classing and storing client socket instances.
 * @class
 */
export default class SocketInstances {
  private static readonly _adminSocketInstances = new SocketInstancesStorage();
  private static readonly _clientSocketInstances = new SocketInstancesStorage();

  /**
   * Admin socket instances list.
   * @static
   */
  static get Admin() {
    return this._adminSocketInstances;
  }

  /**
   * Client socket instances list.
   * @static
   */
  static get Client() {
    return this._clientSocketInstances;
  }

  /**
   * Adding socket instances by user type.
   * @param {ConnectedPayloadType} payload - The data payload.
   * @param {Socket} socket - The socket client.
   */
  static addSocketClient(payload: ConnectedPayloadType, socket: Socket): void {
    if (payload.view === VIEW.ADMIN) {
      this.Admin.addSocketClient(payload.userId, socket);
    } else {
      this.Client.addSocketClient(payload.userId, socket);
    }
  }
}
