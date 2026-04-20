import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogStatus } from '@prisma/client';

@Injectable()
export class LogsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    eventId: string;
    status: LogStatus;
    message: string;
    processorId?: string;
    duration?: number;
  }) {
    return this.prisma.eventLog.create({ data });
  }

  async findAll(opts: {
    page?: number;
    limit?: number;
    eventId?: string;
    status?: LogStatus;
  }) {
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
  }

  async findByEventId(eventId: string) {
    return this.prisma.eventLog.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
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
  }
}
