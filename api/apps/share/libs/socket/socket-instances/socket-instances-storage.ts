import { Socket } from 'socket.io';
import { SOCKET_NAME } from '@share/enums';

/**
 * Storage all socket client.
 * @class
 */
export default class SocketInstancesStorage {
  private wsInstances: Map<string, Socket>;
  private name: string;
  private static Groups: Record<string, Map<string, Socket> | null> = {};

  constructor(name: SOCKET_NAME) {
    this.name = name;
    if (!Object.hasOwn(SocketInstancesStorage.Groups, name)) {
      this.wsInstances = new Map<string, Socket>();
      SocketInstancesStorage.Groups[name] = this.wsInstances;
    }
  }

  get WSInstances() {
    return SocketInstancesStorage.Groups[this.name];
  }

  /**
   * Adding socket client to storage.
   * @param {string} userId - An userId.
   * @param {Socket} client - The socket client.
   */
  addSocketClient(userId: string, client: Socket): void {
    this.WSInstances?.set(userId, client);
  }

  /**
   * Get socket client from storage.
   * @param {string} userId - An userId
   * @returns {Socket | undefined} - The socket client.
   */
  getSocketClient(userId: string): Socket | undefined {
    return this.WSInstances?.get(userId);
  }

  /**
   * Return all socket clients.
   * @returns {Socket[]} - All socket clients.
   */
  getAllSocketClient(): Socket[] {
    if (this.WSInstances) {
      return Array.from(this.WSInstances.values());
    }
    return [];
  }

  /**
   * Remove socket client out of storage.
   * @param {string} userId - An userId
   */
  removeSocketClient(userId: string): void {
    this.WSInstances?.delete(userId);
  }
}
