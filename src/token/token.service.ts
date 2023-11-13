import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BalanceEntity } from 'src/entities/balance';
import { Token } from 'src/schemas/token';
import { Utxo } from 'src/schemas/utxo';
import { findWithTotalCount } from 'src/utils/helpers';

@Injectable()
export class TokenService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    @InjectModel(Utxo.name) private utxoModel: Model<Utxo>,
  ) {
    this.logger = new Logger(TokenService.name);
  }

  async getAll(pagination = null) {
    const tokens = await findWithTotalCount(this.tokenModel, {}, pagination);
    return tokens;
  }

  async get(ticker: string, id: number) {
    const token = await this.tokenModel.findOne({ ticker, id }).exec();
    if (token) return token;
    else throw new NotFoundException({ error: 'token not found' });
  }

  async getByTicker(ticker: string, pagination = null) {
    const tokens = await findWithTotalCount(
      this.tokenModel,
      { ticker },
      pagination,
    );
    return tokens;
  }

  async getByTxId(txId: string, pagination = null) {
    const tokens = await findWithTotalCount(
      this.tokenModel,
      { txId },
      pagination,
    );
    return tokens;
  }

  async getByCollectionAddress(collection: string) {
    const token = await this.tokenModel
      .findOne({ collectionAddress: collection })
      .exec();
    if (token) return token;
    else throw new NotFoundException({ error: 'token not found' });
  }

  async getByPid(pid: number) {
    const token = await this.tokenModel.findOne({ pid }).exec();
    if (token) return token;
    else throw new NotFoundException({ error: 'token not found' });
  }

  async getByPidRange(start: number, stop: number, pagination = null) {
    const query = {
      pid: { $gte: start, $lte: stop },
    };
    const tokens = await findWithTotalCount(this.tokenModel, query, pagination);
    return tokens;
  }

  async getByBlock(block: number, pagination = null) {
    const tokens = await findWithTotalCount(
      this.tokenModel,
      { block },
      pagination,
    );
    return tokens;
  }

  async getByMimetype(mime: string, pagination = null) {
    const tokens = await findWithTotalCount(
      this.tokenModel,
      { mime },
      pagination,
    );
    return tokens;
  }

  async getByDeployer(beneficiaryAddress: string, pagination = null) {
    const tokens = await findWithTotalCount(
      this.tokenModel,
      { beneficiaryAddress },
      pagination,
    );
    return tokens;
  }

  async getTokenMetadata(ticker: string, id: number) {
    const token = await this.tokenModel.findOne({ ticker, id }).exec();
    if (token)
      return { metadata: token?.metadata, mime: token?.mime, ref: token?.ref };
    else throw new NotFoundException({ error: 'token not found' });
  }

  async findByTickerSimilarity(ticker: string, pagination = null) {
    const regex = new RegExp(ticker, 'i');
    const query = { ticker: { $regex: regex } };
    const tokens = await findWithTotalCount(this.tokenModel, query, pagination);
    return tokens;
  }

  async getBalance(
    address: string,
    ticker: string,
    id: number,
  ): Promise<BalanceEntity> {
    const utxos = await this.utxoModel.find({ address, ticker, id }).exec();
    if (utxos.length === 0) {
      throw new NotFoundException({ error: 'token not found' });
    }

    let totalAmount = 0n;
    const decimals = utxos[0].decimals;

    utxos.forEach((utxo: Utxo) => {
      totalAmount += BigInt(utxo.amount);
    });

    return {
      ticker,
      id,
      amount: totalAmount.toString(),
      decimals,
    };
  }

  async getBalancesForAddress(address: string): Promise<BalanceEntity[]> {
    const utxos = await this.utxoModel.find({ address }).exec();

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

  async getHoldersByToken(ticker: string, id: number) {
    const token = await this.tokenModel.find({ ticker, id }).limit(1).exec();

    const balanceMap = new Map<string, { amount: bigint; decimals: number }>();
    const utxos = await this.utxoModel.find({ ticker, id }).exec();
    utxos.forEach((utxo: Utxo) => {
      const address = utxo.address;
      const balance = balanceMap.get(address) || {
        amount: 0n,
        decimals: utxo.decimals,
      };

      balance.amount += BigInt(utxo.amount);
      balanceMap.set(address, balance);
    });

    const holders = Array.from(balanceMap, ([address, balance]) => ({
      address,
      amount: balance.amount.toString(),
    }));

    return { token, holders };
  }
}
