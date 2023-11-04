import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from 'src/schemas/token';
import { IndexScheduler } from './indexer.scheduler';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { TokenCreatedListener } from 'src/events/token.listener';
import { TokenGateway } from 'src/events/token.gateway';
import { UtxoService } from 'src/utxo/utxo.service';
import { Utxo, UtxoSchema } from 'src/schemas/utxo';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Utxo.name, schema: UtxoSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
  ],
  controllers: [TokenController],
  providers: [
    IndexScheduler,
    TokenService,
    TokenCreatedListener,
    TokenGateway,
    UtxoService,
  ],
})
export class TokenModule {}
