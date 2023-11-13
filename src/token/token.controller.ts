import {
  ClassSerializerInterceptor,
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
import { PaginationInterceptor } from 'src/interceptors/pagination';
import { BalanceEntity } from 'src/entities/balance';
import { hexToString } from 'src/utils/helpers';
import { LowercasePipe } from 'src/validation/lowercase';
import { TokenExtendedEntity } from 'src/entities/token-extended';

@Controller('token')
@UseInterceptors(CacheInterceptor)
@UseInterceptors(PaginationInterceptor)
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
    const tokens = await this.tokenService.getAll(pagination);
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
      ticker,
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
    @Param('ticker', LowercasePipe) ticker: string,
    @Pagination() pagination: any,
  ) {
    const tokens = await this.tokenService.getByTicker(ticker, pagination);
    return tokens;
  }

  @ApiOperation({ summary: 'Get a token by ticker and id' })
  @ApiResponse({
    status: 200,
    type: TokenEntity,
  })
  @Get('/get/:ticker/:id')
  async get(
    @Param('ticker', LowercasePipe) ticker: string,
    @Param('id') id: number,
  ) {
    const token = await this.tokenService.get(ticker, id);
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
  async getByCollectionAddress(
    @Param('collection', LowercasePipe) collection: string,
  ) {
    const token = await this.tokenService.getByCollectionAddress(collection);
    if (!token) {
      throw new NotFoundException({ error: 'token not found' });
    }
    return token;
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

  @ApiOperation({ summary: 'Get tokens by pid range' })
  @ApiResponse({
    status: 200,
    type: [TokenEntity],
  })
  @Get('/by-pid-range/:start/:stop')
  async getByPidRange(
    @Param('start') start: number,
    @Param('stop') stop: number,
    @Pagination() pagination: any,
  ) {
    const tokens = await this.tokenService.getByPidRange(
      start,
      stop,
      pagination,
    );
    return tokens;
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

  @ApiOperation({ summary: 'Get tokens by deployer address' })
  @ApiResponse({
    status: 200,
    type: [TokenEntity],
  })
  @Get('/by-deployer/:address')
  async getByDeployer(
    @Param('address', LowercasePipe) address: string,
    @Pagination() pagination: any,
  ) {
    const tokens = await this.tokenService.getByDeployer(address, pagination);
    return tokens;
  }

  @ApiOperation({ summary: 'Get tokens by transaction id' })
  @ApiResponse({
    status: 200,
    type: [TokenEntity],
  })
  @Get('/by-deployer/:address')
  async getByTxId(
    @Param('txId', LowercasePipe) txId: string,
    @Pagination() pagination: any,
  ) {
    const tokens = await this.tokenService.getByTxId(txId, pagination);
    return tokens;
  }

  @ApiOperation({ summary: 'Get tokens by mime type' })
  @ApiResponse({
    status: 200,
    type: [TokenEntity],
  })
  @Get('/by-mime/:mime')
  async getByMime(@Param('mime') mime: string, @Pagination() pagination: any) {
    const tokens = await this.tokenService.getByMimetype(mime, pagination);
    return tokens;
  }

  @ApiOperation({ summary: 'Get all the holders for a specific token' })
  @ApiResponse({
    status: 200,
    type: [TokenExtendedEntity],
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/get-holders/:ticker/:id/')
  async getHoldersByToken(
    @Param('ticker', LowercasePipe) ticker: string,
    @Param('id') id: number,
  ) {
    const { token, holders } = await this.tokenService.getHoldersByToken(
      ticker,
      id,
    );
    return { token, holders };
  }

  @ApiOperation({ summary: 'Get a specific token balance for a given address' })
  @ApiResponse({
    status: 200,
    type: BalanceEntity,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/get-balance/:ticker/:id/:address')
  async getBalanceByAddress(
    @Param('ticker', LowercasePipe) ticker: string,
    @Param('id') id: number,
    @Param('address', LowercasePipe) address: string,
  ): Promise<BalanceEntity> {
    const balance = await this.tokenService.getBalance(address, ticker, id);
    return balance;
  }

  @ApiOperation({ summary: 'Get all tokens held by a given address' })
  @ApiResponse({
    status: 200,
    type: [BalanceEntity],
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('balances/:address')
  async getTokensByAddress(
    @Param('address', LowercasePipe) address: string,
  ): Promise<BalanceEntity[]> {
    const balances = await this.tokenService.getBalancesForAddress(address);
    return balances;
  }

  @ApiOperation({ summary: 'Get the metadata related to a given token' })
  @Get('metadata/:ticker/:id')
  async getTokenMetadata(
    @Param('ticker', LowercasePipe) ticker: string,
    @Param('id') id: number,
    @Res() res: Response,
  ) {
    const tokenData = await this.tokenService.getTokenMetadata(ticker, id);

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
        case 'text/plain;charset=utf-8':
        case 'text/markdown':
        case 'text/html':
        case 'text/css':
        case 'text/javascript':
          res.setHeader('Content-Type', tokenData.mime);
          res.send(hexToString(tokenData.metadata));
          break;
        case '\u0000\u0000':
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
      }
    } else {
      throw new NotFoundException({ error: 'token not found' });
    }
  }
}
