import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventsRepository } from './events.repository';
import { EventType, FLOWOPS_QUEUE } from './events.constants';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private eventsRepository: EventsRepository,
    @InjectQueue(FLOWOPS_QUEUE) private queue: Queue,
  ) {}

  async publish(type: EventType, payload: Record<string, any>, userId?: string) {
    try {
      this.logger.log(`📝 Step 1: Creating event in database - type=${type} userId=${userId}`);
      // 1. Persist event to DB
      const event = await this.eventsRepository.create({
        type,
        payload,
        userId,
      });
      this.logger.log(`✅ Step 1 complete: Event created with id=${event.id}`);

      // 2. Enqueue for async processing
      this.logger.log(`📤 Step 2: Adding job to queue - eventId=${event.id}`);
      const job = await this.queue.add(
        'process-event',
        { eventId: event.id, type: event.type, payload: event.payload },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: false,
          removeOnFail: false,
        },
      );
      this.logger.log(`✅ Step 2 complete: Job added to queue - jobId=${job.id}`);

      return {
        event,
        job: { id: job.id, queue: FLOWOPS_QUEUE },
        message: 'Event published and queued for processing',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to publish event: type=${type} userId=${userId}`, error);
      throw error;
    }
  }

  async findAll(page?: number, limit?: number) {
    try {
      return await this.eventsRepository.findAll(page, limit);
    } catch (error) {
      this.logger.error(`Failed to fetch events: page=${page} limit=${limit}`, error);
      throw error;
    }
  }

  async findById(id: string) {
    try {
      const event = await this.eventsRepository.findById(id);
      if (!event) {
        throw new NotFoundException(`Event ${id} not found`);
      }
      return event;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to fetch event by id: ${id}`, error);
      throw error;
    }
  }
}
