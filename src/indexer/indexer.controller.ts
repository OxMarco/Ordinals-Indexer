import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Response } from 'express';
import { IndexerService } from './indexer.service';
import { TokenEntity } from 'src/entities/token';
import { MongooseClassSerializerInterceptor } from 'src/interceptors/mongoose';

@Controller('indexer')
@UseInterceptors(CacheInterceptor)
@MongooseClassSerializerInterceptor(TokenEntity)
export class IndexerController {
  constructor(private readonly indexerService: IndexerService) {}

  @Get('/tokens')
  async getAll() {
    const tokens = await this.indexerService.getAll();
    return tokens;
  }

  @Get('/block')
  getLatestBlock() {
    return this.indexerService.getLatestBlock();
  }

  @Get('/get-token/:ticker/:id')
  async get(@Param('ticker') ticker: string, @Param('id') id: number) {
    const token = await this.indexerService.get(ticker, id);
    if (!token) {
      throw new NotFoundException({ error: 'token not found' });
    }
    return token;
  }

  @Get('/get-token/:ticker')
  async getByTicker(@Param('ticker') ticker: string) {
    const token = await this.indexerService.getByTicker(ticker);
    if (!token) {
      throw new NotFoundException({ error: 'token not found' });
    }
    return token;
  }

  @Get('balance/:ticker/:id/:address')
  async getTokenBalanceByAddress(
    @Param('ticker') ticker: string,
    @Param('id') id: number,
    @Param('address') address: string,
  ) {
    const balance = await this.indexerService.getTokenBalanceByAddress(
      ticker,
      id,
      address,
    );
    return balance;
  }

  @Get('balance/:address')
  async getTokensByAddress(@Param('address') address: string) {
    const tokens = await this.indexerService.getTokensByAddress(address);
    return tokens;
  }

  @Get('token-metadata/:ticker/:id')
  async getTokenMetadata(
    @Param('ticker') ticker: string,
    @Param('id') id: number,
    @Res() res: Response,
  ) {
    const tokenData = await this.indexerService.getTokenMetadata(ticker, id);

    if (!tokenData || !tokenData.metadata || !tokenData.mime) {
      throw new NotFoundException({ error: 'token not found' });
    }

    switch (tokenData.mime) {
      case 'application/json':
      case 'text/plain':
      case 'text/markdown':
      case 'text/html':
      case 'text/css':
      case 'text/javascript':
        res.setHeader('Content-Type', tokenData.mime);
        res.send(tokenData.metadata); // @todo fix this
        break;
      case 'image/webp':
      case 'image/png':
      case 'image/jpeg':
      case 'image/gif':
        const binaryData = Buffer.from(tokenData.metadata, 'hex');
        res.setHeader('Content-Type', tokenData.mime);
        res.send(binaryData);
        break;
      case 'audio/mpeg':
      case 'audio/ogg':
        const audioData = Buffer.from(tokenData.metadata, 'hex');
        res.setHeader('Content-Type', tokenData.mime);
        res.send(audioData);
        break;
      default:
        res.status(415).send({ error: 'unsupported mime type' });
        break;
    }
  }
}
