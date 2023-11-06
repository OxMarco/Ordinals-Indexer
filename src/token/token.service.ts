import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LevelDBService } from 'src/db/level.service';
import { Balance } from 'src/schemas/balance';
import { Remaining } from 'src/schemas/remaining';
import { Token } from 'src/schemas/token';
import { getPaginationOptions } from 'src/utils/helpers';

@Injectable()
export class TokenService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    @InjectModel(Remaining.name) private remainingModel: Model<Remaining>,
    @InjectModel(Balance.name) private balanceModel: Model<Balance>,
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

  async getLatestBalanceByAddress(address: string, ticker: string, id: number) {
    const token = await this.tokenModel.findOne({ ticker, id }).exec();
    if (token != null) {
      const record = await this.balanceModel
        .findOne({ address, token: token._id })
        .sort({ block: -1 }) // Sort by 'block' in descending order
        .exec();
      return record?.balance;
    } else {
      throw new Error(`Token ${ticker}:${id} not found`);
    }
  }

  async getBalancesForAddress(address: string) {
    const balances = await this.balanceModel
      .aggregate([
        { $match: { address: address } },
        {
          $sort: { block: -1 },
        },
        {
          $group: {
            _id: '$token', // Group by token
            block: { $first: '$block' }, // Take the first (highest) block from the sorted documents
            balance: { $first: '$balance' }, // Take the balance from the document with the highest block
            address: { $first: '$address' }, // Take the address from the document with the highest block
          },
        },
        {
          $lookup: {
            from: 'tokens', // Assuming your tokens collection is named 'tokens'
            localField: '_id',
            foreignField: '_id',
            as: 'tokenDetails',
          },
        },
        {
          $unwind: '$tokenDetails', // Unwind the tokenDetails since $lookup returns an array
        },
        {
          $project: {
            _id: 0, // Suppress the _id field
            token: '$_id', // Include the token id
            balance: 1, // Include the balance
            block: 1, // Include the block
            address: 1, // Include the address
            tokenDetails: 1, // Include the joined token details
          },
        },
      ])
      .exec();

    return balances;
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
        return amt; // @todo consider returning decimals too
      }
    } catch (e) {}

    return 0;
  }
}
