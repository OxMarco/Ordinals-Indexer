import { Module, Global } from '@nestjs/common';
import { Level } from 'level';
import { LevelDBService } from './leveldb.service';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: 'LEVELDB_CONNECTION',
      useFactory: async () => {
        const db = new Level('pipe_db', { valueEncoding: 'json' });
        return db;
      },
    },
    LevelDBService,
  ],
  exports: ['LEVELDB_CONNECTION', LevelDBService],
})
export class LevelDBModule {}
