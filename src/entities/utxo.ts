import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Token } from 'src/schemas/token';

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
  spent: boolean;

  @ApiProperty()
  @Expose()
  ticker: string;

  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  token: Token;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<UtxoEntity>) {
    Object.assign(this, partial);
  }
}
