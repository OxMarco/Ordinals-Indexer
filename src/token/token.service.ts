import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LevelDBService } from 'src/leveldb/leveldb.service';
import { Token } from 'src/schemas/token';
import { getPaginationOptions } from 'src/utils/helpers';

@Injectable()
export class TokenService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(Token.name) private tokenModel: Model<Token>,
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
    return token;
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
    return token;
  }

  async getBalancesForAddress(address: string) {
    // @todo
  }

  async getByPid(pid: number) {
    return await this.tokenModel.find({ pid }).exec();
  }

  async getByBlock(block: number, pagination = null) {
    const options = getPaginationOptions(pagination);
    return await this.tokenModel.find({ block }, null, options).exec();
  }

  async getTokenMetadata(ticker: string, id: number) {
    const token = await this.tokenModel.findOne({ ticker, id }).exec();
    return { metadata: token?.metadata, mime: token?.mime, ref: token?.ref };
  }

  async findByTickerSimilarity(ticker: string, pagination = null) {
    const options = getPaginationOptions(pagination);
    const regex = new RegExp(ticker, 'i');
    return await this.tokenModel
      .find({ ticker: { $regex: regex } }, null, options)
      .exec();
  }

  async getBalance(address: string, ticker: string, id: number) {
    try {
      const token = await this.get(ticker, id);
      if (token !== null) {
        const address_amt =
          'a_' + address + '_' + ticker.toLowerCase() + '_' + id;
        const amt = await this.leveldbService.get(address_amt);
        return { ...token, amount: amt };
      }
    } catch (e) {}

    return {};
  }
}
