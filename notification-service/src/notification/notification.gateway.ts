import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface NotificationPayload {
  type: 'import' | 'export' | string;
  status: 'started' | 'completed' | 'failed' | string;
  message: string;
  data?: any;
  timestamp?: Date;
  userId?: string;
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

  // Map to store userId -> socketId relationships
  private userSockets = new Map<string, string[]>();
  private socketUsers = new Map<string, string>();

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // Clean up user-socket mappings
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      // this.userSockets.delete(userId);

      // Instead of delete all the socket IDs for the user, remove only the disconnected one
      const socketIds = this.userSockets.get(userId) || [];
      const updatedSocketIds = socketIds.filter((id) => id !== client.id);

      this.userSockets.set(userId, updatedSocketIds);
      this.socketUsers.delete(client.id);
      this.logger.debug(`User ${userId} disconnected`);
    }
    this.logger.debug(`Client disconnected ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoinUser(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;

    // Remove previous socket mapping if user reconnects
    const oldSocketIds = this.userSockets.get(userId) || [];
    // if (oldSocketIds.length > 0) {
    //   oldSocketIds.forEach((socketId) => this.socketUsers.delete(socketId));
    // }

    // Store new mapping
    this.userSockets.set(userId, [...oldSocketIds, client.id]);
    this.socketUsers.set(client.id, userId);

    this.logger.debug(`User ${userId} joined with socket ${client.id}`);

    this.logger.debug(this.userSockets);

    // Send confirmation
    client.emit('joined', {
      userId,
      message: 'Successfully joined notifications',
    });
  }

  sendNotification(notification: NotificationPayload) {
    const payload = {
      ...notification,
      id: Date.now().toString(),
      timestamp: notification.timestamp ?? new Date(),
    };

    if (notification.userId) {
      // Send to specific user
      const socketId = this.userSockets.get(notification.userId);
      if (socketId && socketId.length > 0) {
        // socketId.forEach((id) => {
        //   this.server.to(id).emit('notification', payload);
        // });
        this.server.to(socketId).emit('notification', payload);

        this.logger.debug(
          `Notification sent to user ${notification.userId}: ${payload.message}`,
        );
      } else {
        this.logger.warn(
          `User ${notification.userId} not connected, notification not sent: ${payload.message}`,
        );
      }
    } else {
      // Broadcast to all clients (fallback behavior)
      this.server.emit('notification', payload);
      this.logger.debug(`Notification broadcast: ${payload.message}`);
    }
  }
}
