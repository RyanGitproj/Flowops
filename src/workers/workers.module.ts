import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventProcessor } from './event.processor';
import { AutomationEngine } from './automation.engine';
import { EventsRepository } from '../events/events.repository';
import { LogsRepository } from '../logs/logs.repository';
import { FLOWOPS_QUEUE } from '../events/events.constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: parseInt(config.get('REDIS_PORT', '6379'), 10),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: FLOWOPS_QUEUE }),
  ],
  providers: [
    EventProcessor,
    AutomationEngine,
    EventsRepository,
    LogsRepository,
  ],
})
export class WorkersModule {}
