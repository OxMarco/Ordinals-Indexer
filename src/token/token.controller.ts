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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import axios from 'axios';
import { Pagination } from 'src/decorators/pagination';
import { TokenService } from './token.service';
import { TokenEntity } from 'src/entities/token';
import { MongooseClassSerializerInterceptor } from 'src/interceptors/mongoose';

@Controller('token')
@UseInterceptors(CacheInterceptor)
@MongooseClassSerializerInterceptor(TokenEntity)
@ApiTags('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @ApiOperation({ summary: 'Get all recorded tokens' })
  @ApiResponse({
    status: 200,
    type: [TokenEntity],
  })
  @Get('/')
  async getAll(@Pagination() pagination: any) {
    const tokens = this.tokenService.getAll(pagination);
    return tokens;
  }

  @ApiOperation({ summary: 'Search tokens by ticker' })
  @ApiResponse({
    status: 200,
    type: [TokenEntity],
  })
  @Get('/search')
  async searchByTicker(
    @Query('ticker') ticker: string,
    @Pagination() pagination: any,
  ) {
    const tokens = await this.tokenService.findByTickerSimilarity(
      ticker.toLowerCase(),
      pagination,
    );
    return tokens;
  }

  @ApiOperation({ summary: 'Get a token by ticker' })
  @ApiResponse({
    status: 200,
    type: [TokenEntity],
  })
  @Get('/by-ticker/:ticker')
  async getByTicker(
    @Param('ticker') ticker: string,
    @Pagination() pagination: any,
  ) {
    const tokens = await this.tokenService.getByTicker(
      ticker.toLowerCase(),
      pagination,
    );
    return tokens;
  }

  @ApiOperation({ summary: 'Get a token by ticker and id' })
  @ApiResponse({
    status: 200,
    type: TokenEntity,
  })
  @Get('/get/:ticker/:id')
  async get(@Param('ticker') ticker: string, @Param('id') id: number) {
    const token = await this.tokenService.get(ticker.toLowerCase(), id);
    if (!token) {
      throw new NotFoundException({ error: 'token not found' });
    }
    return token;
  }

  @ApiOperation({ summary: 'Get a token by collection address' })
  @ApiResponse({
    status: 200,
    type: TokenEntity,
  })
  @Get('/by-collection/:collection')
  async getByCollectionAddress(@Param('collection') collection: string) {
    const token = await this.tokenService.getByCollectionAddress(
      collection.toLowerCase(),
    );
    if (!token) {
      throw new NotFoundException({ error: 'token not found' });
    }
    return token;
  }

  @ApiOperation({ summary: 'Get a specific token balance for a given address' })
  @ApiResponse({
    status: 200,
    type: Number,
  })
  @Get('/get-balance/:ticker/:id/:address')
  async getBalanceByAddress(
    @Param('ticker') ticker: string,
    @Param('id') id: number,
    @Param('address') address: string,
  ) {
    const balance = await this.tokenService.getBalanceByAddress(
      ticker.toLowerCase(),
      id,
      address.toLowerCase(),
    );
    return balance;
  }

  @ApiOperation({ summary: 'Get a token by pid' })
  @ApiResponse({
    status: 200,
    type: TokenEntity,
  })
  @Get('/by-pid/:pid')
  async getByPid(@Param('pid') pid: number) {
    const token = await this.tokenService.getByPid(pid);
    if (!token) {
      throw new NotFoundException({ error: 'token not found' });
    }
    return token;
  }

  @ApiOperation({ summary: 'Get tokens by block' })
  @ApiResponse({
    status: 200,
    type: [TokenEntity],
  })
  @Get('/by-block/:block')
  async getByBlock(
    @Param('block') block: number,
    @Pagination() pagination: any,
  ) {
    const tokens = await this.tokenService.getByBlock(block, pagination);
    return tokens;
  }

  @ApiOperation({ summary: 'Get all tokens held by a given address' })
  @ApiResponse({
    status: 200,
    type: [TokenEntity],
  })
  @Get('balances/:address')
  async getTokensByAddress(
    @Param('address') address: string,
    @Pagination() pagination: any,
  ) {
    const tokens = await this.tokenService.getTokensByAddress(
      address.toLowerCase(),
      pagination,
    );
    return tokens;
  }

  @ApiOperation({ summary: 'Get the metadata related to a given token' })
  @Get('metadata/:ticker/:id')
  async getTokenMetadata(
    @Param('ticker') ticker: string,
    @Param('id') id: number,
    @Res() res: Response,
  ) {
    const tokenData = await this.tokenService.getTokenMetadata(
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
          res.send(tokenData.metadata);
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
