import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface NotificationPayload {
  type: 'import' | 'export' | string;
  status: 'started' | 'completed' | 'failed' | string;
  message: string;
  data?: any;
  timestamp?: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('NotificationGateway');

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected ${client.id}`);
  }

  sendNotification(notification: NotificationPayload) {
    const payload = {
      ...notification,
      id: Date.now().toString(),
      timestamp: notification.timestamp ?? new Date(),
    };
    this.server.emit('notification', payload);
    this.logger.debug(`Notification emitted: ${payload.message}`);
  }
}
