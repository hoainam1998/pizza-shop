import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'http';
import { ServerOptions } from 'socket.io';

export class SocketIoAdapter extends IoAdapter {
  constructor(
    appOrHttpServer: INestApplicationContext,
    private readonly wsOptions: any,
  ) {
    super(appOrHttpServer);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    return super.createIOServer(+this.wsOptions.get('ports.SOCKET_PORT') || port, {
      ...options,
      pingInterval: +this.wsOptions.get('socket.SOCKET_PING_INTERVAL'),
      pingTimeout: +this.wsOptions.get('socket.SOCKET_PING_TIMEOUT'),
      cors: {
        origin: '*',
      },
    });
  }
}
