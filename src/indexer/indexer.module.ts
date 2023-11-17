import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { UtxoService } from 'src/utxo/utxo.service';
import { TokenService } from 'src/token/token.service';
import { Token, TokenSchema } from 'src/schemas/token';
import { Utxo, UtxoSchema } from 'src/schemas/utxo';
import { IndexerService } from './indexer.service';
import { IndexScheduler } from './indexer.scheduler';
import { IndexerConsumer } from './indexer.consumer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Token.name, schema: TokenSchema },
      { name: Utxo.name, schema: UtxoSchema },
    ]),
    BullModule.registerQueue({
      name: 'indexer',
    }),
  ],
  providers: [
    IndexerService,
    TokenService,
    UtxoService,
    IndexScheduler,
    IndexerConsumer,
  ],
})
export class IndexerModule {}
