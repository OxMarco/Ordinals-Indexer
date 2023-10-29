import { Level } from 'level';

export class LevelDbAdapter {
  private levelDb: any;
  private block: number;

  constructor(dbName: string) {
    this.levelDb = new Level(dbName, { valueEncoding: 'json' });
    if (!this.levelDb.supports.permanence) {
      throw new Error('Persistent storage is required');
    }
  }

  public setBlock(block: number) {
    this.block = block;
  }

  public async removeAll(block: number) {
    for await (const key of this.levelDb.keys({ block })) {
      await this.levelDb.del(key);
    }
  }

  public async get(key: string) {
    if (this.block > 0) {
      const res = JSON.parse(await this.levelDb.get(key));
      return res.value;
    } else {
      throw new Error('Block not set');
    }
  }

  public async set(key: string, value: any) {
    if (!this.block) throw new Error('Block not set');

    return await this.levelDb.put(
      key,
      JSON.stringify({ block: this.block, value }),
    );
  }

  public async del(key: string) {
    if (!this.block) throw new Error('Block not set');

    return await this.levelDb.del(key);
  }

  public async close() {
    await this.levelDb.close();
  }
}
