import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogStatus } from '@prisma/client';

@Injectable()
export class LogsRepository {
  private readonly logger = new Logger(LogsRepository.name);

  constructor(private prisma: PrismaService) {}

  async create(data: {
    eventId: string;
    status: LogStatus;
    message: string;
    processorId?: string;
    duration?: number;
  }) {
    try {
      const result = await this.prisma.eventLog.create({ data });
      return result;
    } catch (error) {
      this.logger.error(`Failed to create log: eventId=${data.eventId}`, error);
      throw error;
    }
  }

  async findAll(opts: {
    page?: number;
    limit?: number;
    eventId?: string;
    status?: LogStatus;
  }) {
    try {
      const { page = 1, limit = 20, eventId, status } = opts;
      const skip = (page - 1) * limit;
      const where: any = {};
      if (eventId) where.eventId = eventId;
      if (status) where.status = status;

      const [items, total] = await Promise.all([
        this.prisma.eventLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            event: { select: { id: true, type: true, status: true } },
          },
        }),
        this.prisma.eventLog.count({ where }),
      ]);

      return { items, total, page, limit };
    } catch (error) {
      this.logger.error(`Failed to fetch logs`, error);
      throw error;
    }
  }

  async findByEventId(eventId: string) {
    try {
      const result = await this.prisma.eventLog.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' },
      });
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch logs by eventId: ${eventId}`, error);
      throw error;
    }
  }

  async getStats() {
    try {
      const [total, byStatus] = await Promise.all([
        this.prisma.eventLog.count(),
        this.prisma.eventLog.groupBy({
          by: ['status'],
          _count: { status: true },
        }),
      ]);

      const stats = byStatus.reduce(
        (acc, row) => {
          acc[row.status] = row._count.status;
          return acc;
        },
        {} as Record<string, number>,
      );

      return { total, byStatus: stats };
    } catch (error) {
      this.logger.error('Failed to fetch log statistics', error);
      throw error;
    }
  }
}
