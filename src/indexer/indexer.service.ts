import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token } from 'src/schemas/token';
import { Utxo } from 'src/schemas/utxo';

@Injectable()
export class IndexerService implements OnModuleInit {
  private readonly logger: Logger;
  private pid: number;

  constructor(
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    @InjectModel(Utxo.name) private utxoModel: Model<Utxo>,
  ) {
    this.logger = new Logger(IndexerService.name);
  }

  async onModuleInit() {
    const records = await this.tokenModel.countDocuments().exec();
    if (records === 1) this.pid = 0;
    else this.pid = records;
  }

  async saveOrUpdateToken(tokenData: any) {
    try {
      const existingToken = await this.tokenModel
        .findOne({ ticker: tokenData.ticker, id: tokenData.id })
        .exec();

      if (existingToken) {
        existingToken.remaining =
          tokenData.remaining ?? existingToken.remaining;
        await existingToken.save();
      } else {
        tokenData.pid = this.pid;
        const newToken = new this.tokenModel(tokenData);
        await newToken.save();
        this.pid += 1;
      }
    } catch (e) {
      this.logger.error(
        `Error occurred during save or update of token ${tokenData.ticker}:${tokenData.id}`,
      );
      this.logger.error(e);
    }
  }

  async addUtxo(data: any, block: number) {
    try {
      const utxo: Utxo = {
        address: data.addr,
        txId: data.txid,
        vout: data.vout,
        amount: data.amt,
        ticker: data.tick,
        id: data.id,
        block: block,
      };
      const newUtxo = new this.utxoModel(utxo);
      await newUtxo.save();
    } catch (e) {
      this.logger.error(`Error occurred when saving new utxo ${data.txid}`);
      this.logger.error(e);
    }
  }

  async deleteUtxo(txId: string, vout: number) {
    try {
      const utxo = await this.utxoModel.findOneAndDelete({ txId, vout }).exec();
      if (utxo) {
        this.logger.log(
          `UTXO with txId: ${txId} and vout: ${vout} deleted successfully.`,
        );
      } else {
        this.logger.error(
          `UTXO with txId ${txId} and vout: ${vout} not found.`,
        );
      }
    } catch (e) {
      this.logger.error(
        `Error occurred when deleting UTXO with txId ${txId} and vout: ${vout}.`,
      );
      this.logger.error(e);
    }
  }

  async removeAllRecordsByBlock(block: number) {
    try {
      await this.tokenModel.deleteMany({ block }).exec();
      await this.utxoModel.deleteMany({ block }).exec();
      this.pid = await this.tokenModel.countDocuments().exec();
    } catch (e) {
      this.logger.error(
        `Error occurred when removing tokens for block ${block}`,
      );
      this.logger.error(e);
    }
  }
}
