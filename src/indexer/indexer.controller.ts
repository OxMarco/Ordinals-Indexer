import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Res,
  UnsupportedMediaTypeException,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Response } from 'express';
import axios from 'axios';
import { Pagination } from 'src/decorators/pagination';
import { IndexerService } from './indexer.service';
import { TokenEntity } from 'src/entities/token';
import { MongooseClassSerializerInterceptor } from 'src/interceptors/mongoose';

@Controller('indexer')
//@UseInterceptors(CacheInterceptor)
@MongooseClassSerializerInterceptor(TokenEntity)
export class IndexerController {
  constructor(private readonly indexerService: IndexerService) {}

  @Get('/latest-block')
  getLatestBlock() {
    return this.indexerService.getLatestBlock();
  }

  @Get('/')
  async getAll(@Pagination() pagination: any) {
    const tokens = await this.indexerService.getAll(pagination);
    return tokens;
  }

  @Get('/search')
  async searchByTicker(@Query('ticker') ticker: string, @Pagination() pagination: any) {
    const tokens = await this.indexerService.findByTickerSimilarity(ticker, pagination);
    return tokens;
  }

  @Get('/by-ticker/:ticker')
  async getByTicker(@Param('ticker') ticker: string, @Pagination() pagination: any) {
    const tokens = await this.indexerService.getByTicker(ticker.toLowerCase(), pagination);
    return tokens;
  }

  @Get('/get/:ticker/:id')
  async get(@Param('ticker') ticker: string, @Param('id') id: number) {
    const token = await this.indexerService.get(ticker.toLowerCase(), id);
    if (!token) {
      throw new NotFoundException({ error: 'token not found' });
    }
    return token;
  }

  @Get('/by-collection/:collection')
  async getByCollectionAddress(@Param('collection') collection: string) {
    const token = await this.indexerService.getByCollectionAddress(
      collection.toLowerCase(),
    );
    if (!token) {
      throw new NotFoundException({ error: 'token not found' });
    }
    return token;
  }

  @Get('/get-balance/:ticker/:id/:address')
  async getTokenBalanceByAddress(
    @Param('ticker') ticker: string,
    @Param('id') id: number,
    @Param('address') address: string,
  ) {
    const balance = await this.indexerService.getTokenBalanceByAddress(
      ticker.toLowerCase(),
      id,
      address,
    );
    return balance;
  }

  @Get('/by-pid/:pid')
  async getByPid(@Param('pid') pid: number) {
    const tokens = await this.indexerService.getByPid(pid);
    return tokens;
  }

  @Get('/by-block/:block')
  async getByBlock(@Param('block') block: number, @Pagination() pagination: any) {
    const tokens = await this.indexerService.getByBlock(block, pagination);
    return tokens;
  }

  @Get('balances/:address')
  async getTokensByAddress(@Param('address') address: string, @Pagination() pagination: any) {
    const tokens = await this.indexerService.getTokensByAddress(address, pagination);
    return tokens;
  }

  @Get('metadata/:ticker/:id')
  async getTokenMetadata(
    @Param('ticker') ticker: string,
    @Param('id') id: number,
    @Res() res: Response,
  ) {
    const tokenData = await this.indexerService.getTokenMetadata(
      ticker.toLowerCase(),
      id,
    );

    if (tokenData.ref) {
      try {
        const response = await axios.get(tokenData.ref, {
          responseType: 'arraybuffer',
        });
        const mimeType = response.headers['content-type'];
        if (mimeType) {
          res.setHeader('Content-Type', mimeType);
          res.send(response.data);
        } else {
          throw new UnsupportedMediaTypeException({
            error: 'mime type not found',
          });
        }
      } catch (error) {
        throw new NotFoundException({ error: 'file not found' });
      }
    } else if (tokenData.mime && tokenData.metadata) {
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
          throw new UnsupportedMediaTypeException({
            error: 'mime type not found',
          });
          break;
      }
    } else {
      throw new NotFoundException({ error: 'token not found' });
    }
  }
}
