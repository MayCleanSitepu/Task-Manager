import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  async handleJoin(client: Socket, userId: string) {
    await client.join(`user_${userId}`);
    console.log(`User ${userId} joined their notification room`);
  }

  sendNotification(
    userId: string,
    event: string,
    data: Record<string, unknown>,
  ) {
    this.server.to(`user_${userId}`).emit(event, data);
  }

  broadcastNotification(event: string, data: Record<string, unknown>) {
    this.server.emit(event, data);
  }
}
