import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model } from 'mongoose';
import { Token } from 'src/schemas/token';
import { TokenCreatedEvent } from 'src/events/token-created.event';
import { getPaginationOptions } from 'src/utils/helpers';

@Injectable()
export class TokenService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    private eventEmitter: EventEmitter2,
  ) {
    this.logger = new Logger(TokenService.name);
  }

  async getAll(pagination = null) {
    try {
      const options = getPaginationOptions(pagination);
      const tokens = await this.tokenModel.find({}, null, options).exec();
      return tokens;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async get(ticker: string, id: number) {
    try {
      const token = await this.tokenModel.findOne({ ticker, id }).exec();
      return token;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getByTicker(ticker: string, pagination = null) {
    try {
      const options = getPaginationOptions(pagination);
      const tokens = await this.tokenModel
        .find({ ticker }, null, options)
        .exec();
      return tokens;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getByCollectionAddress(address: string) {
    try {
      const tokens = await this.tokenModel
        .find({ collectionAddress: address })
        .exec();
      return tokens;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getBalanceByAddress(ticker: string, id: number, address: string) {
    try {
      const token = await this.tokenModel.findOne({ ticker, id }).exec();
      return { balance: token?.balances.get(address) };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getTokensByAddress(address: string, pagination = null) {
    try {
      const userTokens: Token[] = [];
      const tokens = await this.getAll(pagination);
      for (const token of tokens) {
        if (BigInt(token.balances.get(address) || 0) > 0)
          userTokens.push(token);
      }

      return userTokens;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getByPid(pid: number) {
    try {
      return await this.tokenModel.find({ pid }).exec();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getByBlock(block: number, pagination = null) {
    try {
      const options = getPaginationOptions(pagination);
      return await this.tokenModel.find({ block }, null, options).exec();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getTokenMetadata(ticker: string, id: number) {
    try {
      const token = await this.tokenModel.findOne({ ticker, id }).exec();
      return { metadata: token?.metadata, mime: token?.mime, ref: token?.ref };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findByTickerSimilarity(ticker: string, pagination = null) {
    try {
      const options = getPaginationOptions(pagination);
      const regex = new RegExp(ticker, 'i');
      return await this.tokenModel
        .find({ ticker: { $regex: regex } }, null, options)
        .exec();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async saveNewToken(token: Token) {
    const existingToken = await this.tokenModel.findOne(token);
    if (existingToken) {
      this.logger.error(`token ${token.ticker}:${token.id} already exists`);
    }

    const newToken = new this.tokenModel(token);
    await newToken.save();

    const tokenCreatedEvent = new TokenCreatedEvent();
    tokenCreatedEvent.ticker = newToken.ticker;
    tokenCreatedEvent.id = newToken.id;
    this.eventEmitter.emit('token.created', tokenCreatedEvent);
  }

  async updateTokenData(ticker: string, id: number, data: any) {
    const token: any = await this.tokenModel
      .findOne({
        ticker,
        id,
      })
      .exec();
    if (token !== null) {
      for (const key in data) {
        if (data[key] != null) {
          token[key] = data[key];
        }
      }

      await token.save();
    } else {
      this.logger.error(`token ${ticker}:${id} not found`);
    }
  }

  async updateTokenBalances(
    ticker: string,
    id: number,
    values: { address: string; newBalance: string },
  ) {
    const token = await this.tokenModel
      .findOne({
        ticker,
        id,
      })
      .exec();
    if (token !== null) {
      const address = values.address;
      token.balances.set(address, values.newBalance);
      await token.save();
    } else {
      this.logger.error(`token ${ticker}:${id} not found`);
    }
  }

  async removeAll(block: number) {
    try {
      await this.tokenModel.deleteMany({ block }).exec();
    } catch (error) {
      this.logger.error(error);
      throw new Error(error.message);
    }
  }
}
