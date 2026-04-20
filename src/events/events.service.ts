import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventsRepository } from './events.repository';
import { CreateEventDto } from './events.dto';
import { FLOWOPS_QUEUE } from './events.constants';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private eventsRepository: EventsRepository,
    @InjectQueue(FLOWOPS_QUEUE) private queue: Queue,
  ) {}

  async publish(dto: CreateEventDto) {
    // 1. Persist event to DB
    const event = await this.eventsRepository.create({
      type: dto.type as any,
      payload: dto.payload,
      userId: dto.userId,
    });

    // 2. Enqueue for async processing
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

    this.logger.log(
      `📤 Event published | type=${event.type} | id=${event.id} | jobId=${job.id}`,
    );

    return {
      event,
      job: { id: job.id, queue: FLOWOPS_QUEUE },
      message: 'Event published and queued for processing',
    };
  }

  async findAll(page?: number, limit?: number) {
    return this.eventsRepository.findAll(page, limit);
  }

  async findById(id: string) {
    const event = await this.eventsRepository.findById(id);
    if (!event) throw new NotFoundException(`Event ${id} not found`);
    return event;
  }
}
