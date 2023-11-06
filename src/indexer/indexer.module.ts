import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IndexerService } from './indexer.service';
import { IndexScheduler } from './indexer.scheduler';
import { UtxoService } from 'src/utxo/utxo.service';
import { TokenService } from 'src/token/token.service';
import { Balance, BalanceSchema } from 'src/schemas/balance';
import { Remaining, RemainingSchema } from 'src/schemas/remaining';
import { Token, TokenSchema } from 'src/schemas/token';
import { Utxo, UtxoSchema } from 'src/schemas/utxo';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Utxo.name, schema: UtxoSchema },
      { name: Token.name, schema: TokenSchema },
      { name: Balance.name, schema: BalanceSchema },
      { name: Remaining.name, schema: RemainingSchema },
    ]),
  ],
  providers: [IndexerService, TokenService, UtxoService, IndexScheduler],
})
export class IndexerModule {}
