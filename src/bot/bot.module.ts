import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenService } from 'src/token/token.service';
import { Token, TokenSchema } from 'src/schemas/token';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
  ],
  controllers: [],
  providers: [TokenService],
})
export class BotModule {}
