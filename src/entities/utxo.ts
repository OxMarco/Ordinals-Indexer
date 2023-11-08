import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UtxoEntity {
  @ApiProperty()
  @Expose()
  address: string;

  @ApiProperty()
  @Expose()
  txId: string;

  @ApiProperty()
  @Expose()
  vout: number;

  @ApiProperty()
  @Expose()
  amount: string;

  @ApiProperty()
  @Expose()
  ticker: string;

  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UtxoEntity>) {
    Object.assign(this, partial);
  }
}
