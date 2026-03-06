import { Socket } from 'socket.io';

jest.mock('../socket-instances/socket-instances-storage', () => {
  return jest.fn().mockImplementation(() => {
    return {
      wsInstances: new Map<string, Socket>(),
      getSocketClient: jest.fn(),
      addSocketClient: jest.fn(),
      removeSocketClient: jest.fn(),
    };
  });
});
