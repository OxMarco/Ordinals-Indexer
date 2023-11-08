import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Level } from 'level';
import { sleep } from 'src/utils/helpers';

@Injectable()
export class LevelDBService implements OnModuleDestroy {
  constructor(@Inject('LEVELDB_CONNECTION') private db: Level) {}

  async onModuleDestroy() {
    while (true) {
      try {
        await this.db.get('mrk');
      } catch (e) {
        await this.db.close();
        return;
      }
      await sleep(10);
    }
  }

  async get(key: string) {
    return await this.db.get(key);
  }

  async put(key: string, value: any) {
    return await this.db.put(key, value);
  }

  async del(key: string) {
    return await this.db.del(key);
  }

  async close() {
    await this.db.close();
  }

  iterator() {
    return this.db.iterator();
  }
}
