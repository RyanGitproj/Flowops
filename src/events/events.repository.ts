import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventType, EventStatus } from '@prisma/client';

@Injectable()
export class EventsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    type: EventType;
    payload: Record<string, any>;
    userId?: string;
  }) {
    return this.prisma.event.create({
      data: {
        type: data.type,
        payload: data.payload,
        userId: data.userId ?? null,
        status: 'PENDING',
      },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, name: true } },
          logs: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      this.prisma.event.count(),
    ]);
    return { items, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        logs: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async updateStatus(id: string, status: EventStatus) {
    return this.prisma.event.update({ where: { id }, data: { status } });
  }
}
