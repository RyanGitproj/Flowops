import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventsRepository } from './events.repository';
import { FLOWOPS_QUEUE } from './events.constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        // Support both REDIS_URL (Render) and REDIS_HOST/REDIS_PORT (local)
        const redisUrl = config.get('REDIS_URL');
        if (redisUrl) {
          return {
            redis: redisUrl,
            connectTimeout: 30000,
            enableReadyCheck: false,
            connection: {
              maxRetriesPerRequest: 5,
              retryStrategy: (times) => {
                const delay = Math.min(times * 100, 5000);
                return delay;
              },
            },
            defaultJobOptions: {
              attempts: 3,
              backoff: { type: 'exponential', delay: 2000 },
            },
          };
        }
        return {
          redis: {
            host: config.get('REDIS_HOST', 'localhost'),
            port: parseInt(config.get('REDIS_PORT', '6379'), 10),
            connectTimeout: 10000,
            lazyConnect: false,
          },
          enableReadyCheck: false,
          connection: {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
              const delay = Math.min(times * 50, 2000);
              return delay;
            },
          },
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: FLOWOPS_QUEUE }),
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository],
  exports: [BullModule, EventsRepository],
})
export class EventsModule {}
