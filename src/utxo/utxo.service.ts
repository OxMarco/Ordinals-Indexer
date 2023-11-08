import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Utxo } from 'src/schemas/utxo';
import { getPaginationOptions } from 'src/utils/helpers';

@Injectable()
export class UtxoService {
  private readonly logger: Logger;

  constructor(@InjectModel(Utxo.name) private utxoModel: Model<Utxo>) {
    this.logger = new Logger(UtxoService.name);
  }

  async getAll(pagination: any) {
    const options = getPaginationOptions(pagination);
    const utxos = await this.utxoModel.find({}, null, options).exec();
    return utxos;
  }

  async getByToken(ticker: string, id: number, pagination: any) {
    const options = getPaginationOptions(pagination);
    const utxos = await this.utxoModel
      .find({ ticker, id }, null, options)
      .exec();
    return utxos;
  }

  async getByTxId(txid: string, pagination: any) {
    const options = getPaginationOptions(pagination);
    const utxos = await this.utxoModel
      .find({ txId: txid }, null, options)
      .exec();
    return utxos;
  }

  async getByTxidVout(txid: string, vout: number) {
    const utxo = await this.utxoModel.findOne({ txId: txid, vout }).exec();
    if (utxo) return utxo;
    else throw new NotFoundException({ error: 'utxo not found' });
  }
}
