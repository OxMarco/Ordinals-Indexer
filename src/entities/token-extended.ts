import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class Holder {
  @ApiProperty()
  @Expose()
  address: string;

  @ApiProperty()
  @Expose()
  amount: string;
}

export class TokenExtendedEntity {
  @ApiProperty()
  @Expose()
  token: any;

  @ApiProperty()
  @Expose()
  holders: Holder[];

  constructor(partial: Partial<TokenExtendedEntity>) {
    Object.assign(this, partial);
  }
}
