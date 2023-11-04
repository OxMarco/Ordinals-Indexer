import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token } from 'src/schemas/token';
import { Utxo } from 'src/schemas/utxo';
import { getPaginationOptions } from 'src/utils/helpers';

@Injectable()
export class UtxoService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    @InjectModel(Utxo.name) private utxoModel: Model<Utxo>,
  ) {
    this.logger = new Logger(UtxoService.name);
  }

  async getAll(pagination: any) {
    try {
      const options = getPaginationOptions(pagination);
      const utxos = await this.utxoModel.find({}, null, options).exec();
      return utxos;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getByTxId(txid: string, pagination: any) {
    try {
      const options = getPaginationOptions(pagination);
      const utxos = await this.tokenModel.find({ txId: txid }, null, options).exec();
      return utxos;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async addUtxo(
    address: string,
    txid: string,
    vout: number,
    amount: string,
    ticker: string,
    id: number,
  ) {
    const token = await this.tokenModel
      .findOne({
        ticker,
        id,
      })
      .exec();
    if (token !== null) {
      const utxoData = {
        address,
        txId: txid,
        vout,
        amount,
        token: token._id,
      };
      const newUtxo = new this.utxoModel(utxoData);
      await newUtxo.save();
    } else {
      this.logger.error(`token ${ticker}:${id} not found`);
    }
  }

  async markUtxoAsSpent(txId: string) {
    const utxo = await this.utxoModel.findOne({ txId }).exec();
    if (utxo !== null) {
      utxo.spent = true;
      await utxo.save();
    } else {
      this.logger.error(`utxo with txId ${txId} not found`);
    }
  }
}
