import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BalanceEntity } from 'src/entities/balance';
import { LevelDBService } from 'src/leveldb/leveldb.service';
import { Token } from 'src/schemas/token';
import { Utxo } from 'src/schemas/utxo';
import { getPaginationOptions } from 'src/utils/helpers';

@Injectable()
export class TokenService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    @InjectModel(Utxo.name) private utxoModel: Model<Utxo>,
    private readonly leveldbService: LevelDBService,
  ) {
    this.logger = new Logger(TokenService.name);
  }

  async getAll(pagination = null) {
    const options = getPaginationOptions(pagination);
    const tokens = await this.tokenModel.find({}, null, options).exec();
    return tokens;
  }

  async get(ticker: string, id: number) {
    const token = await this.tokenModel.findOne({ ticker, id }).exec();
    if (token) return token;
    else throw new NotFoundException({ error: 'token not found' });
  }

  async getByTicker(ticker: string, pagination = null) {
    const options = getPaginationOptions(pagination);
    const tokens = await this.tokenModel.find({ ticker }, null, options).exec();
    return tokens;
  }

  async getByCollectionAddress(address: string) {
    const token = await this.tokenModel
      .findOne({ collectionAddress: address })
      .exec();
    if (token) return token;
    else throw new NotFoundException({ error: 'token not found' });
  }

  async getByPid(pid: number) {
    const token = await this.tokenModel.find({ pid }).exec();
    if (token) return token;
    else throw new NotFoundException({ error: 'token not found' });
  }

  async getByBlock(block: number, pagination = null) {
    const options = getPaginationOptions(pagination);
    return await this.tokenModel.find({ block }, null, options).exec();
  }

  async getTokenMetadata(ticker: string, id: number) {
    const token = await this.tokenModel.findOne({ ticker, id }).exec();
    if (token)
      return { metadata: token?.metadata, mime: token?.mime, ref: token?.ref };
    else throw new NotFoundException({ error: 'token not found' });
  }

  async findByTickerSimilarity(ticker: string, pagination = null) {
    const options = getPaginationOptions(pagination);
    const regex = new RegExp(ticker, 'i');
    return await this.tokenModel
      .find({ ticker: { $regex: regex } }, null, options)
      .exec();
  }

  async getBalance(
    address: string,
    ticker: string,
    id: number,
  ): Promise<BalanceEntity> {
    try {
      const token = await this.get(ticker, id);
      if (token !== null) {
        const address_amt =
          'a_' + address + '_' + ticker.toLowerCase() + '_' + id;
        const amt = JSON.parse(await this.leveldbService.get(address_amt));
        return { decimals: token.decimals, amount: amt.value, ticker, id };
      }
    } catch (e) {}

    throw new NotFoundException({ error: 'token not found' });
  }

  async getBalancesForAddress(address: string): Promise<BalanceEntity[]> {
    const utxos = await this.utxoModel.find({ address: address }).exec();
    const balanceMap = new Map();

    utxos.forEach((utxo: Utxo) => {
      const key = `${utxo.ticker}-${utxo.id}`;
      const value = balanceMap.get(key) || { amount: 0n, decimals: 0 };
      value.decimals = utxo.decimals;
      value.amount += BigInt(utxo.amount);
      balanceMap.set(key, value);
    });

    const balances = Array.from(balanceMap, ([key, value]) => {
      const [ticker, id] = key.split('-');
      return {
        ticker,
        id: Number(id),
        amount: value.amount.toString(),
        decimals: value.decimals,
      };
    });

    return balances;
  }
}
