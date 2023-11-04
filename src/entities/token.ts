import { Exclude, Expose } from 'class-transformer';

export class TokenEntity {
  @Expose()
  pid: number;

  @Expose()
  beneficiaryAddress: string;

  @Expose()
  ticker: string;

  @Expose()
  id: number;

  @Expose()
  decimals: number;

  @Expose()
  maxSupply: number;

  @Expose()
  remaining: number;

  @Expose()
  limit: number;

  @Expose()
  mime: string;

  @Expose()
  metadata: string;

  @Expose()
  ref?: string;

  @Expose()
  traits?: string;

  @Expose()
  collectionNumber?: number;

  @Expose()
  collectionAddress?: string;

  @Expose()
  txId: string;

  @Expose()
  block: number;

  @Expose()
  bvo: number;

  @Expose()
  vo: number;

  @Exclude()
  balances: any;

  constructor(partial: Partial<TokenEntity>) {
    Object.assign(this, partial);
  }
}
