import { Inject, Injectable } from '@nestjs/common';
import { Level } from 'level';
import { IndexerService } from 'src/indexer/indexer.service';
import { Token } from 'src/schemas/token';

@Injectable()
export class LevelDBService {
  private block: number;
  private indexerService;

  constructor(@Inject('LEVELDB_CONNECTION') private db: Level,
  private readonly service: IndexerService) {
    this.indexerService = service;
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
      await this.indexerService.markUtxoAsSpent(data.txid, data.vout);
      // Parse deployment
    } else if (key.startsWith('d_')) {
      const parsedVal = JSON.parse(value);
      try {
        await this.db.get(key);
        // deployment already exists, it's an update
        await this.indexerService.updateRemaining(
          parsedVal.tick,
          parsedVal.id,
          parsedVal.rem,
          this.block,
        );
      } catch {
        // deployment does not exist, it's a new deployment
        const data: Token = {
          pid: 0,
          ticker: parsedVal.tick,
          id: parsedVal.id,
          beneficiaryAddress: parsedVal?.baddr,
          decimals: parsedVal?.dec,
          maxSupply: parsedVal?.max,
          limit: parsedVal?.lim,
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
        await this.indexerService.saveDeployment(data);
      }
    } else if (key.startsWith('a_')) {
      // Update user balance
      const parts = key.split('_');
      const data = {
        balance: value,
        address: parts[1],
        ticker: parts[2],
        id: parseInt(parts[3]),
      };
      this.indexerService.updateBalance(
        data.ticker,
        data.id,
        data.address,
        data.balance,
        this.block,
      );
    } else if (key.startsWith('c_max_')) {
      console.log('collectible max update');
    }
  }

  public async get(key: string) {
    const res = JSON.parse(await this.db.get(key));
    return res.value;
  }

  public async put(key: string, value: any) {
    if (!this.block) throw new Error('Block not set');

    if(this.block > 0) this._hook(key, value);

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
