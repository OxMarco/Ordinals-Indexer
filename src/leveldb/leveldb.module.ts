import { Module, Global } from '@nestjs/common';
import { Level } from 'level';
import { LevelDBService } from './leveldb.service';
import { Token, TokenSchema } from 'src/schemas/token';
import { Utxo, UtxoSchema } from 'src/schemas/utxo';
import { MongooseModule } from '@nestjs/mongoose';
import { IndexerService } from 'src/indexer/indexer.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Utxo.name, schema: UtxoSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
  ],
  providers: [
    {
      provide: 'LEVELDB_CONNECTION',
      useFactory: async () => {
        const db = new Level('pipe_db', { valueEncoding: 'json' });
        return db;
      },
    },
    LevelDBService,
    IndexerService,
  ],
  exports: ['LEVELDB_CONNECTION', LevelDBService],
})
export class LevelDBModule {}
