import { Module } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { LogsRepository } from './logs.repository';

@Module({
  controllers: [LogsController],
  providers: [LogsService, LogsRepository],
  exports: [LogsRepository],
})
export class LogsModule {}
