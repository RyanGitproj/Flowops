import { Injectable } from '@nestjs/common';
import { LogsRepository } from './logs.repository';
import { LogStatus } from '@prisma/client';

@Injectable()
export class LogsService {
  constructor(private logsRepository: LogsRepository) {}

  findAll(page = 1, limit = 20, eventId?: string, status?: LogStatus) {
    return this.logsRepository.findAll({ page, limit, eventId, status });
  }

  findByEvent(eventId: string) {
    return this.logsRepository.findByEventId(eventId);
  }

  getStats() {
    return this.logsRepository.getStats();
  }
}
