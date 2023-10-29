import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenSchema } from 'src/schemas/token';
import { IndexScheduler } from './indexer.scheduler';
import { IndexerController } from './indexer.controller';
import { IndexerService } from './indexer.service';
import { TokenCreatedListener } from 'src/events/token.listener';
import { IndexerBot } from './indexer.bot';
import { TokenGateway } from 'src/events/token.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Token', schema: TokenSchema }]),
  ],
  controllers: [IndexerController],
  providers: [
    IndexScheduler,
    IndexerService,
    IndexerBot,
    TokenCreatedListener,
    TokenGateway,
  ],
})
export class IndexerModule {}
