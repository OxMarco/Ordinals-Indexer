import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway({ port: 9995, transports: ['websocket'] })
export class TokenGateway {
  @WebSocketServer() private server: any;

  sendTokenCreatedEvent(data: any) {
    this.server.emit('token.created', data);
  }
}
