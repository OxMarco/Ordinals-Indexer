import { Exclude, Expose } from 'class-transformer';

export class TokenEntity {
  @Expose()
  pid: number;

  @Expose()
  ticker: string;

  @Expose()
  id: number;

  @Expose()
  decimals: number;

  @Expose()
  maxSupply: number;

  @Expose()
  limit: number;

  @Exclude()
  mime: string;

  @Exclude()
  metadata: string;

  @Expose()
  ref?: string;

  @Expose()
  traits?: string;

  @Expose()
  collectionNumber: number;

  @Expose()
  collectionAddress: string;

  @Expose()
  txId: string;

  @Expose()
  block: number;

  @Exclude()
  balances: any;

  constructor(partial: Partial<TokenEntity>) {
    Object.assign(this, partial);
  }
}
