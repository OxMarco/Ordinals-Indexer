import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UtxoService } from './utxo.service';
import { Pagination } from 'src/decorators/pagination';
import { MongooseClassSerializerInterceptor } from 'src/interceptors/mongoose';
import { UtxoEntity } from 'src/entities/utxo';
import { LowercasePipe } from 'src/validation/lowercase';

@Controller('utxo')
@UseInterceptors(CacheInterceptor)
@MongooseClassSerializerInterceptor(UtxoEntity)
@ApiTags('utxo')
export class UtxoController {
  constructor(private readonly utxoService: UtxoService) {}

  @ApiOperation({ summary: 'Get all recorded utxos' })
  @ApiResponse({
    status: 200,
    type: [UtxoEntity],
  })
  @Get('/')
  async getAll(@Pagination() pagination: any) {
    const utxos = await this.utxoService.getAll(pagination);
    return utxos;
  }

  @ApiOperation({ summary: 'Get all utxos related to the given txId' })
  @ApiResponse({
    status: 200,
    type: [UtxoEntity],
  })
  @Get('/by-txid/:txid')
  async getByTxId(
    @Param('txid', LowercasePipe) txid: string,
    @Pagination() pagination: any,
  ) {
    const utxos = await this.utxoService.getByTxId(txid, pagination);
    return utxos;
  }

  @ApiOperation({ summary: 'Get all utxos related to the given address' })
  @ApiResponse({
    status: 200,
    type: [UtxoEntity],
  })
  @Get('/by-address/:address')
  async getByAddress(
    @Param('address', LowercasePipe) address: string,
    @Pagination() pagination: any,
  ) {
    const utxos = await this.utxoService.getByAddress(address, pagination);
    return utxos;
  }

  @ApiOperation({ summary: 'Get the utxo with the given txId and vout' })
  @ApiResponse({
    status: 200,
    type: UtxoEntity,
  })
  @Get('/get/:txid/:vout')
  async getByTxidVout(
    @Param('txid', LowercasePipe) txid: string,
    @Param('vout') vout: number,
  ) {
    const utxo = await this.utxoService.getByTxidVout(txid, vout);
    if (!utxo) {
      throw new NotFoundException({ error: 'utxo not found' });
    }
  }

  @ApiOperation({
    summary: 'Get all utxos related to the given fields',
  })
  @ApiParam({
    name: 'params',
    type: String,
    format: 'txid1_vout1,txid2_vout2,...,txidN_voutN',
  })
  @ApiResponse({
    status: 200,
    type: [UtxoEntity],
  })
  @Get('search')
  async search(@Query('params') params: string, @Pagination() pagination: any) {
    const utxos = await this.utxoService.searchUtxos(params, pagination);
    return utxos;
  }
}
