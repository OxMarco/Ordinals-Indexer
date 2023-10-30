import { Module } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import {
  AutoIncrementID,
  AutoIncrementIDOptions,
} from '@typegoose/auto-increment';
import { Token, TokenSchema } from 'src/schemas/token';
import { IndexScheduler } from './indexer.scheduler';
import { IndexerController } from './indexer.controller';
import { IndexerService } from './indexer.service';
import { TokenCreatedListener } from 'src/events/token.listener';
import { IndexerBot } from './indexer.bot';
import { TokenGateway } from 'src/events/token.gateway';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Token.name,
        useFactory: async () => {
          const schema = TokenSchema;

          schema.plugin(AutoIncrementID, {
            field: 'pid',
            startAt: 1,
          } satisfies AutoIncrementIDOptions);

          return schema;
        },
        inject: [getConnectionToken()],
      },
    ]),
  ],
  controllers: [IndexerController],
  providers: [
    IndexScheduler,
    IndexerService,
    //IndexerBot,
    TokenCreatedListener,
    TokenGateway,
  ],
})
export class IndexerModule {}
