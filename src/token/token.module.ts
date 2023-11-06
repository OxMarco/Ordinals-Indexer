import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { Token, TokenSchema } from 'src/schemas/token';
import { Balance, BalanceSchema } from 'src/schemas/balance';
import { Remaining, RemainingSchema } from 'src/schemas/remaining';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Token.name, schema: TokenSchema },
      { name: Balance.name, schema: BalanceSchema },
      { name: Remaining.name, schema: RemainingSchema },
    ]),
  ],
  controllers: [TokenController],
  providers: [TokenService],
})
export class TokenModule {}
