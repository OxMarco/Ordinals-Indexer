import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';
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

  async getAll(pagination = null) {
    const options = getPaginationOptions(pagination);
    if (!options || Object.keys(options).length === 0)
      throw new PayloadTooLargeException({
        error: 'pagination options required',
      });
    const utxos = await this.utxoModel.find({}, null, options).exec();
    return utxos;
  }

  async getByToken(ticker: string, id: number, pagination = null) {
    const options = getPaginationOptions(pagination);
    const utxos = await this.utxoModel
      .find({ ticker, id }, null, options)
      .exec();
    return utxos;
  }

  async getByTxId(txid: string, pagination = null) {
    const options = getPaginationOptions(pagination);
    const utxos = await this.utxoModel
      .find({ txId: txid }, null, options)
      .exec();
    return utxos;
  }

  async getByAddress(address: string, pagination = null) {
    const options = getPaginationOptions(pagination);
    const utxos = await this.utxoModel.find({ address }, null, options).exec();
    return utxos;
  }

  async getByTxidVout(txid: string, vout: number) {
    const utxo = await this.utxoModel.findOne({ txId: txid, vout }).exec();
    if (utxo) return utxo;
    else throw new NotFoundException({ error: 'utxo not found' });
  }

  async searchUtxos(params: string, pagination = null) {
    const pairs = params.split(',');

    const queryConditions = pairs.map((pair) => {
      const [txId, voutStr] = pair.split('_');

      if (!txId || isNaN(+voutStr)) {
        throw new BadRequestException({
          error: 'invalid txId or vout in params',
        });
      }

      const vout = parseInt(voutStr, 10);
      return { txId, vout };
    });

    // Proceed with the query
    const options = getPaginationOptions(pagination);
    const utxos = await this.utxoModel
      .find({ $or: queryConditions }, null, options)
      .exec();
    return utxos;
  }
}
