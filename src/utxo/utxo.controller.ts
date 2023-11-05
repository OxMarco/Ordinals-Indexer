import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UtxoService } from './utxo.service';
import { Pagination } from 'src/decorators/pagination';
import { MongooseClassSerializerInterceptor } from 'src/interceptors/mongoose';
import { UtxoEntity } from 'src/entities/utxo';

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
  @Get('/:txid')
  async getByTxId(@Param('txid') txid: string, @Pagination() pagination: any) {
    const utxos = await this.utxoService.getByTxId(
      txid.toLowerCase(),
      pagination,
    );
    return utxos;
  }

  @ApiOperation({ summary: 'Get the utxo with the given txId and vout' })
  @ApiResponse({
    status: 200,
    type: UtxoEntity,
  })
  @Get('/:txid/:vout')
  async getByTxidVout(
    @Param('txid') txid: string,
    @Param('vout') vout: number,
  ) {
    const utxo = await this.utxoService.getByTxidVout(txid.toLowerCase(), vout);
    if (!utxo) {
      throw new NotFoundException({ error: 'utxo not found' });
    }
  }
}
