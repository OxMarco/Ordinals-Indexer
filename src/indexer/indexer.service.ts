import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { Token } from 'src/schemas/token';
import { TokenCreatedEvent } from 'src/events/token-created.event';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IndexerService {
  latestBlock = 0;
  private openai;

  constructor(
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
  ) {
    const key = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = new OpenAI({
      apiKey: key,
    });
  }

  getLatestBlock() {
    return this.latestBlock;
  }

  async getAll() {
    try {
      const tokens = await this.tokenModel.find().exec();
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

  async getByTicker(ticker: string) {
    try {
      const tokens = await this.tokenModel.find({ ticker }).exec();
      return tokens;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getTokenBalanceByAddress(ticker: string, id: number, address: string) {
    try {
      const token = await this.tokenModel.findOne({ ticker, id }).exec();
      return { balance: token?.balances.get(address) };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getTokensByAddress(address: string) {
    try {
      const userTokens: Token[] = [];
      const tokens = await this.getAll();
      for (const token of tokens) {
        if (BigInt(token.balances.get(address) || 0) > 0)
          userTokens.push(token);
      }

      return userTokens;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getTokenMetadata(ticker: string, id: number) {
    try {
      const token = await this.tokenModel.findOne({ ticker, id }).exec();
      return { metadata: token?.metadata, mime: token?.mime };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async saveNewToken(token: Token) {
    try {
      const newToken = new this.tokenModel(token);
      await newToken.save();

      const tokenCreatedEvent = new TokenCreatedEvent();
      tokenCreatedEvent.ticker = newToken.ticker;
      tokenCreatedEvent.id = newToken.id;
      this.eventEmitter.emit('token.created', tokenCreatedEvent);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateTokenBalances(
    filter: any,
    values: { address: string; balance: bigint },
  ) {
    const token = await this.tokenModel.findOne(filter).exec();
    if (token !== null) {
      const newBalance =
        BigInt(token.balances.get(values.address) || 0) + values.balance;
      token.balances.set(values.address, newBalance.toString());
      await token.save();
    }
  }

  async askChatGPT(text: string) {
    const chatCompletion: OpenAI.Chat.ChatCompletion =
      await this.openai.chat.completions.create({
        messages: [{ role: 'user', content: text }],
        model: 'gpt-3.5-turbo',
      });
    return chatCompletion.choices[0].message.content;
  }
}
