import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventType, EventStatus } from '@prisma/client';

@Injectable()
export class EventsRepository {
  private readonly logger = new Logger(EventsRepository.name);

  constructor(private prisma: PrismaService) {}

  async create(data: {
    type: EventType;
    payload: Record<string, any>;
    userId?: string;
  }) {
    try {
      const result = await this.prisma.event.create({
        data: {
          type: data.type,
          payload: data.payload,
          userId: data.userId ?? null,
          status: 'PENDING',
        },
        include: { user: { select: { id: true, email: true, name: true } } },
      });
      return result;
    } catch (error) {
      this.logger.error(`Failed to create event: type=${data.type}`, error);
      throw error;
    }
  }

  async findAll(page = 1, limit = 20) {
    try {
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
    } catch (error) {
      this.logger.error(`Failed to fetch events: page=${page} limit=${limit}`, error);
      throw error;
    }
  }

  async findById(id: string) {
    try {
      const result = await this.prisma.event.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, email: true, name: true } },
          logs: { orderBy: { createdAt: 'desc' } },
        },
      });
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch event by id: ${id}`, error);
      throw error;
    }
  }

  async updateStatus(id: string, status: EventStatus) {
    try {
      const result = await this.prisma.event.update({ where: { id }, data: { status } });
      return result;
    } catch (error) {
      this.logger.error(`Failed to update event status: id=${id} status=${status}`, error);
      throw error;
    }
  }
}
