import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token } from 'src/schemas/token';
import { Utxo } from 'src/schemas/utxo';

@Injectable()
export class IndexerService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    @InjectModel(Utxo.name) private utxoModel: Model<Utxo>,
  ) {
    this.logger = new Logger(IndexerService.name);
  }

  async saveDeployment(token: Token) {
    try {
      const existingToken = await this.tokenModel
        .findOne({ ticker: token.ticker, id: token.id })
        .exec();
      if (!existingToken) {
        token.pid = (await this.tokenModel.countDocuments().exec()) + 1;
        const newToken = new this.tokenModel(token);
        await newToken.save();
      } else {
        console.log(token);
        this.logger.error(
          `Duplicated entry for token ${token.ticker}:${token.id}`,
        );
      }
    } catch (e) {
      this.logger.error(
        `Error occurred when saving token ${token.ticker}:${token.id}`,
      );
      this.logger.error(e);
    }
  }

  async updateRemaining(ticker: string, id: number, remaining: number) {
    try {
      const token = await this.tokenModel.findOne({ ticker, id }).exec();
      if (token) {
        token.remaining = remaining;
        await token.save();
      } else {
        this.logger.error(`token ${ticker}:${id} not found`);
      }
    } catch (e) {
      this.logger.error(`Error occurred when updating token ${ticker}:${id}`);
      this.logger.error(e);
    }
  }

  async addUtxo(data: any, block: number) {
    try {
      const token = await this.tokenModel
        .findOne({ ticker: data.tick, id: data.id })
        .exec();
      if (token != null) {
        const utxo: Utxo = {
          address: data.addr,
          txId: data.txid,
          vout: data.vout,
          amount: data.amt,
          token: token,
          spent: false,
          block: block,
        };
        const newUtxo = new this.utxoModel(utxo);
        await newUtxo.save();
      } else {
        this.logger.error(`Token ${data.tick}:${data.id} not found`);
      }
    } catch (e) {
      this.logger.error(`Error occurred when saving new utxo ${data.txid}`);
      this.logger.error(e);
    }
  }

  async markUtxoAsSpent(txId: string, vout: number, block: number) {
    try {
      const utxo = await this.utxoModel.findOne({ txId, vout }).exec();
      if (utxo !== null) {
        utxo.spent = true;
        utxo.block = block;
        await utxo.save();
      } else {
        this.logger.error(`utxo with txId ${txId} not found`);
      }
    } catch (e) {
      this.logger.error(`Error occurred when marking utxo ${txId} as spent`);
      this.logger.error(e);
    }
  }

  async removeAllRecordsByBlock(block: number) {
    try {
      await this.tokenModel.deleteMany({ block }).exec();
      await this.utxoModel.deleteMany({ block }).exec();
    } catch (e) {
      this.logger.error(
        `Error occurred when removing tokens for block ${block}`,
      );
      this.logger.error(e);
    }
  }
}
