import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { FLOWOPS_QUEUE } from '../events/events.constants';
import { EventsRepository } from '../events/events.repository';
import { LogsRepository } from '../logs/logs.repository';
import { AutomationEngine } from './automation.engine';

export interface EventJobData {
  eventId: string;
  type: string;
  payload: Record<string, any>;
}

@Processor(FLOWOPS_QUEUE)
export class EventProcessor {
  private readonly logger = new Logger(EventProcessor.name);

  constructor(
    private eventsRepository: EventsRepository,
    private logsRepository: LogsRepository,
    private automationEngine: AutomationEngine,
  ) {
    this.logger.log('🤖 EventProcessor initialized and ready to process events');
  }

  @Process('process-event')
  async handleEvent(job: Job<EventJobData>) {
    const { eventId, type, payload } = job.data;
    const startTime = Date.now();

    this.logger.log(
      `⚙️  Processing job #${job.id} | event=${eventId} | type=${type} | attempt=${job.attemptsMade + 1}`,
    );

    // Mark event as PROCESSING
    await this.eventsRepository.updateStatus(eventId, 'PROCESSING');
    await this.logsRepository.create({
      eventId,
      status: 'PROCESSING',
      message: `Job #${job.id} started (attempt ${job.attemptsMade + 1})`,
      processorId: `worker-${process.pid}`,
    });

    try {
      // Run automation logic
      const result = await this.automationEngine.handle(type, payload, eventId);

      const duration = Date.now() - startTime;

      // Mark event as SUCCESS
      await this.eventsRepository.updateStatus(eventId, 'SUCCESS');
      await this.logsRepository.create({
        eventId,
        status: 'SUCCESS',
        message: `✅ Processed successfully | action=${result.action} | duration=${duration}ms`,
        processorId: `worker-${process.pid}`,
        duration,
      });

      this.logger.log(
        `✅ Job #${job.id} completed | action=${result.action} | duration=${duration}ms`,
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts || 3);

      const logStatus = isLastAttempt ? 'FAILED' : 'PENDING';
      const eventStatus = isLastAttempt ? 'FAILED' : 'PENDING';

      await this.eventsRepository.updateStatus(eventId, eventStatus as any);
      await this.logsRepository.create({
        eventId,
        status: logStatus as any,
        message: `❌ Error: ${error.message} | attempt=${job.attemptsMade + 1} | willRetry=${!isLastAttempt}`,
        processorId: `worker-${process.pid}`,
        duration,
      });

      this.logger.error(
        `❌ Job #${job.id} failed | event=${eventId} | error=${error.message}`,
      );

      // Re-throw so Bull can retry
      throw error;
    }
  }
}
