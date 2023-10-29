import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TokenCreatedEvent } from 'src/events/token-created.event';
import { TokenGateway } from './token.gateway';

@Injectable()
export class TokenCreatedListener {
  constructor(private readonly tokenGateway: TokenGateway) {}

  @OnEvent('token.created')
  handleTokenCreatedEvent(event: TokenCreatedEvent) {
    this.tokenGateway.sendTokenCreatedEvent(event);
  }
}
