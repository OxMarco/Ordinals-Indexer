import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BalanceEntity {
  @ApiProperty()
  @Expose()
  amount: string;

  @ApiProperty()
  @Expose()
  decimals: number;

  @ApiProperty()
  @Expose()
  ticker: string;

  @ApiProperty()
  @Expose()
  id: number;

  constructor(partial: Partial<BalanceEntity>) {
    Object.assign(this, partial);
  }
}
