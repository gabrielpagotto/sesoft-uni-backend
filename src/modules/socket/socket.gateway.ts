import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    connectedClients: { [key: string]: string } = {};

    handleConnection(client: any, ...args: any[]) {
        this.connectedClients[client.id] = client.id;
    }

    handleDisconnect(client: any) {
        delete this.connectedClients[client.id];
    }

    @WebSocketServer()
    server: Server;

    sendEventToAll(name: 'new-post-created') {
        this.server.emit(name);
    }
}
