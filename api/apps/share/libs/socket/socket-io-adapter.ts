import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'http';
import { ExtendedError, ServerOptions } from 'socket.io';
import { verifyApiKey } from '@share/utils';
import { ConfigService } from '@nestjs/config';
import UserCachingService from '@share/libs/caching/user/user.service';
import messages from '@share/constants/messages';
import EventsGateway from './event-socket.gateway';
import { POWER_NUMERIC, VIEW } from '@share/enums';
import { SocketExtended } from '@share/interfaces';

export class SocketIoAdapter extends IoAdapter {
  constructor(
    appOrHttpServer: INestApplicationContext,
    private readonly config: ConfigService,
    private readonly userCachingService: UserCachingService,
    private readonly eventsGateway: EventsGateway,
  ) {
    super(appOrHttpServer);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(+this.config.get('ports.SOCKET_PORT') || port, {
      ...options,
      pingInterval: +this.config.get('socket.SOCKET_PING_INTERVAL'),
      pingTimeout: +this.config.get('socket.SOCKET_PING_TIMEOUT'),
      cors: {
        origin: [process.env.ADMIN_ORIGIN_CORS!, process.env.SALE_ORIGIN_CORS!],
      },
    });

    server.use(async (socket: SocketExtended, next: (error?: ExtendedError) => void) => {
      const token = socket.handshake.auth.token;

      if (token) {
        try {
          const requester = verifyApiKey(token as string);
          const oldApiKey = await this.userCachingService.getUserApiKey(requester.userId as string);

          if (oldApiKey === token) {
            socket['requester'] = requester;
            next();
          } else {
            next(new Error(messages.USER.USER_INFO_OUT_OF_DATE));
          }
        } catch (error: any) {
          next(new Error(error.message as string));
        }
      } else {
        next(new Error(messages.USER.API_KEY_INVALID));
      }
    });

    server.on('connection', (socket: SocketExtended) => {
      const requester = socket['requester'];
      const userConnected = {
        userId: requester.userId,
        view: requester.power === POWER_NUMERIC.SALE ? VIEW.CLIENT : VIEW.ADMIN,
      };
      this.eventsGateway.connected(userConnected, socket);
    });

    return server;
  }
}
