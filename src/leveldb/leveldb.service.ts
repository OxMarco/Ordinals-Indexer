import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Level } from 'level';
import { IndexerService } from 'src/indexer/indexer.service';
import { Token } from 'src/schemas/token';
import { sleep } from 'src/utils/helpers';

@Injectable()
export class LevelDBService implements OnModuleDestroy {
  private block: number;
  private indexerService;

  constructor(
    @Inject('LEVELDB_CONNECTION') private db: Level,
    private readonly service: IndexerService,
  ) {
    this.indexerService = service;
  }

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

  public setBlock(block: number) {
    this.block = block;
  }

  public async removeAll(block: number) {
    for await (const [key, val] of this.db.iterator()) {
      const value = JSON.parse(val);
      if (value.block === block) {
        await this.db.del(key);
      }
    }

    await this.indexerService.removeAllRecordsByBlock(block);
  }

  private async _saveToken(parsedVal: any) {
    const data: Token = {
      pid: 0,
      ticker: parsedVal.tick,
      id: parsedVal.id,
      beneficiaryAddress: parsedVal?.baddr,
      decimals: parsedVal?.dec,
      maxSupply: parsedVal?.max,
      limit: parsedVal?.lim,
      remaining: parsedVal?.rem,
      collectionNumber: parsedVal?.colnum,
      collectionAddress: parsedVal?.col,
      txId: parsedVal?.tx,
      block: parsedVal?.blck,
      bvo: parsedVal?.bvo,
      vo: parsedVal?.vo,
      traits: parsedVal?.traits,
      mime: parsedVal?.mime,
      ref: parsedVal?.ref,
      metadata: parsedVal?.metadata,
    };
    await this.indexerService.saveOrUpdateToken(data);
  }

  private async _hook(key: string, value: string) {
    // Parse UTXO
    if (key.startsWith('utxo_')) {
      const parsedVal = JSON.parse(value);
      await this.indexerService.addUtxo(parsedVal, this.block);
      // Parse spent UTXO
    } else if (key.startsWith('spent_')) {
      const parts = key.split('_');
      const data = {
        txid: parts[2],
        vout: parseInt(parts[3]),
      };
      await this.indexerService.deleteUtxo(
        data.txid,
        data.vout,
      );
      // Parse deployment
    } else if (key.startsWith('d_')) {
      const parsedVal = JSON.parse(value);
      this._saveToken(parsedVal);
    } else if (key.startsWith('a_')) {
    } else if (key.startsWith('c_max_')) {
    } else if (key.startsWith('c_')) {
      // new art deployment
      const parsedVal = JSON.parse(value);
      this._saveToken(parsedVal);
    }
  }

  public async get(key: string) {
    const res = JSON.parse(await this.db.get(key));
    return res.value;
  }

  public async put(key: string, value: any) {
    if (!this.block) throw new Error('Block not set');

    if (this.block > 0) this._hook(key, value);

    return await this.db.put(key, JSON.stringify({ block: this.block, value }));
  }

  public async del(key: string) {
    if (!this.block) throw new Error('Block not set');

    return await this.db.del(key);
  }

  public async close() {
    await this.db.close();
  }
}
