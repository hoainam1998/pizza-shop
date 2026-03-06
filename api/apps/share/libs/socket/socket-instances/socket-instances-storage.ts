import { Socket } from 'socket.io';

/**
 * Storage all socket client.
 * @class
 */
export default class SocketInstancesStorage {
  private wsInstances: Map<string, Socket>;

  constructor() {
    this.wsInstances = new Map<string, Socket>();
  }

  /**
   * Adding socket client to storage.
   * @param {string} userId - An userId.
   * @param {Socket} client - The socket client.
   */
  addSocketClient(userId: string, client: Socket): void {
    this.wsInstances.set(userId, client);
  }

  /**
   * Get socket client from storage.
   * @param {string} userId - An userId
   * @returns {Socket | undefined} - The socket client.
   */
  getSocketClient(userId: string): Socket | undefined {
    return this.wsInstances.get(userId);
  }

  /**
   * Remove socket client out of storage.
   * @param {string} userId - An userId
   */
  removeSocketClient(userId: string): void {
    this.wsInstances.delete(userId);
  }
}
