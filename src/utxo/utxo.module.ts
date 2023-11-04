import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UtxoController } from 'src/utxo/utxo.controller';
import { UtxoService } from 'src/utxo/utxo.service';
import { TokenService } from 'src/token/token.service';
import { Utxo, UtxoSchema } from 'src/schemas/utxo';
import { Token, TokenSchema } from 'src/schemas/token';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Utxo.name, schema: UtxoSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
  ],
  controllers: [UtxoController],
  providers: [UtxoService, TokenService],
})
export class UtxoModule {}
