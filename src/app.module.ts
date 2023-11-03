import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { NecordModule, NecordModuleOptions } from 'necord';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IndexerModule } from './indexer/indexer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    /*CacheModule.register({
      ttl: 60 * 5, // time in seconds (5 minutes)
      isGlobal: true,
    }),*/
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          name: configService.get<string>('REDIS_DB_NAME'),
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          username: configService.get<string>('REDIS_USERNAME'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    /*NecordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        ({
          token: configService.get<string>('DISCORD_BOT_TOKEN'),
          intents: ['Guilds', 'GuildMessages'],
        } as NecordModuleOptions),
      inject: [ConfigService],
    }),*/
    IndexerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
