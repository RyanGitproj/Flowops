import { Injectable, Logger } from '@nestjs/common';
import { LogsRepository } from './logs.repository';
import { LogStatus } from '@prisma/client';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  constructor(private logsRepository: LogsRepository) {}

  async findAll(page = 1, limit = 20, eventId?: string, status?: LogStatus) {
    try {
      return await this.logsRepository.findAll({ page, limit, eventId, status });
    } catch (error) {
      this.logger.error(`Failed to fetch logs: page=${page} limit=${limit}`, error);
      throw error;
    }
  }

  async findByEvent(eventId: string) {
    try {
      return await this.logsRepository.findByEventId(eventId);
    } catch (error) {
      this.logger.error(`Failed to fetch logs for eventId: ${eventId}`, error);
      throw error;
    }
  }

  async getStats() {
    try {
      return await this.logsRepository.getStats();
    } catch (error) {
      this.logger.error('Failed to fetch log statistics', error);
      throw error;
    }
  }
}
