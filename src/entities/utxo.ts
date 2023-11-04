import { Expose } from 'class-transformer';
import { Token } from 'src/schemas/token';

export class UtxoEntity {
  @Expose()
  address: string;

  @Expose()
  txId: string;

  @Expose()
  vout: number;

  @Expose()
  amount: string;

  @Expose()
  spent: boolean;

  @Expose()
  token: Token;

  constructor(partial: Partial<UtxoEntity>) {
    Object.assign(this, partial);
  }
}
