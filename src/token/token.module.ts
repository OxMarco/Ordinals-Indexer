import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { Token, TokenSchema } from 'src/schemas/token';
import { LevelDBService } from 'src/leveldb/leveldb.service';
import { Utxo, UtxoSchema } from 'src/schemas/utxo';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Token.name, schema: TokenSchema },
      { name: Utxo.name, schema: UtxoSchema },
    ]),
  ],
  controllers: [TokenController],
  providers: [TokenService, LevelDBService],
})
export class TokenModule {}
