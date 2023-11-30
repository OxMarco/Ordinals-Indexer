import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserEntity {
  @ApiProperty()
  @Expose()
  address: string;

  @ApiPropertyOptional()
  @Expose()
  bio?: string;

  @ApiPropertyOptional()
  @Expose()
  socials?: Map<string, string>;

  @ApiPropertyOptional()
  @Expose()
  avatar?: string;

  @ApiPropertyOptional()
  @Expose()
  header?: string;
}
