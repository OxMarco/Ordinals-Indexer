import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { Token, TokenSchema } from 'src/schemas/token';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
  ],
  controllers: [TokenController],
  providers: [TokenService],
})
export class TokenModule {}
