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
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: parseInt(config.get('REDIS_PORT', '6379'), 10),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: FLOWOPS_QUEUE }),
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository],
  exports: [BullModule, EventsRepository],
})
export class EventsModule {}
