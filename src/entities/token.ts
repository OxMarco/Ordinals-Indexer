import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TokenEntity {
  @ApiProperty()
  @Expose()
  pid: number;

  @ApiProperty()
  @Expose()
  beneficiaryAddress: string;

  @ApiProperty()
  @Expose()
  ticker: string;

  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  decimals: number;

  @ApiProperty()
  @Expose()
  maxSupply: number;

  @ApiProperty()
  @Expose()
  limit: number;

  @ApiProperty()
  @Expose()
  mime: string;

  @ApiProperty()
  @Expose()
  metadata: string;

  @ApiPropertyOptional()
  @Expose()
  ref?: string;

  @ApiPropertyOptional()
  @Expose()
  traits?: string[];

  @ApiPropertyOptional()
  @Expose()
  collectionNumber?: number;

  @ApiPropertyOptional()
  @Expose()
  collectionAddress?: string;

  @ApiProperty()
  @Expose()
  txId: string;

  @ApiProperty()
  @Expose()
  block: number;

  @ApiProperty()
  @Expose()
  bvo: number;

  @ApiProperty()
  @Expose()
  vo: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<TokenEntity>) {
    Object.assign(this, partial);
  }
}
