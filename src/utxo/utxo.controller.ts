import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { UtxoService } from './utxo.service';
import { Pagination } from 'src/decorators/pagination';
import { MongooseClassSerializerInterceptor } from 'src/interceptors/mongoose';
import { UtxoEntity } from 'src/entities/utxo';

@Controller('utxo')
@UseInterceptors(CacheInterceptor)
@MongooseClassSerializerInterceptor(UtxoEntity)
export class UtxoController {
  constructor(private readonly utxoService: UtxoService) {}

  @Get('/')
  async getAll(@Pagination() pagination: any) {
    const utxos = await this.utxoService.getAll(pagination);
    return utxos;
  }

  @Get('/:txid')
  async getByTxId(@Param('txid') txid: string, @Pagination() pagination: any) {
    const utxos = await this.utxoService.getByTxId(txid, pagination);
    return utxos;
  }
}
