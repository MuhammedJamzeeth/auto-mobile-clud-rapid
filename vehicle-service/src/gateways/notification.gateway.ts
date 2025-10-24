import { Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import {Server, Socket} from 'socket.io'

export interface NotificationPayload {
    type: 'import' | 'export';
    status: 'started' | 'completed' | 'failed';
    message: string;
    data?: any;
    timestamp: Date;
}

@WebSocketGateway({
    cors: {
        origin: '*'
    }
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect{
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('NotificationGateway');

    handleConnection(client: Socket) {
        this.logger.debug(`Client connected ${client.id}`)
    }

    handleDisconnect(client: Socket) {
        this.logger.debug(`Client disconnected ${client.id}`)
    }

    // Emit notifications to clients
    sendNotification(notification: NotificationPayload) {
        this.server.emit('notification', {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date()
        });
        this.logger.debug(`Notification sent: ${notification.message}`);
    }

    sendImportCompleted(recordCount: number, hasErrors: boolean = false) {
        this.sendNotification({
            type: 'import',
            status: hasErrors ? 'failed' : 'completed',
            message: hasErrors ? `Import failed for ${recordCount} records` : `Import completed successfully for ${recordCount} records`,
            timestamp: new Date()
        });
    }

    sendExportCompleted(filePath: string, recordCount: number) {
        this.sendNotification({
            type: 'export',
            status: 'completed',
            message: `Export completed successfully for ${recordCount} records`,
            data: {
                filePath
            },
            timestamp: new Date()
        });
    }

    sendJobStatus(type: 'import' | 'export', message: string, status: 'started' | 'completed' | 'failed') {
        this.sendNotification({
            type,
            status,
            message,
            timestamp: new Date()
        });
    }

    
}
