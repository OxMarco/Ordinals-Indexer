import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenService } from 'src/token/token.service';
import { Token, TokenSchema } from 'src/schemas/token';
import { Utxo, UtxoSchema } from 'src/schemas/utxo';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Token.name, schema: TokenSchema },
      { name: Utxo.name, schema: UtxoSchema },
    ]),
  ],
  controllers: [],
  providers: [TokenService],
})
export class BotModule {}
