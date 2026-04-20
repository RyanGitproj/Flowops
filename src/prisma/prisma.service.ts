import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly MAX_RETRIES = 30;
  private readonly INITIAL_RETRY_DELAY = 2000; // 2 seconds

  async onModuleInit() {
    await this.connectWithRetry();
    this.logger.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  private async connectWithRetry(): Promise<void> {
    let retryCount = 0;
    let delay = this.INITIAL_RETRY_DELAY;

    while (retryCount < this.MAX_RETRIES) {
      try {
        await this.$connect();
        return;
      } catch (error) {
        retryCount++;
        if (retryCount >= this.MAX_RETRIES) {
          this.logger.error(`❌ Failed to connect to database after ${this.MAX_RETRIES} attempts`);
          throw error;
        }

        this.logger.warn(
          `⏳ Database connection attempt ${retryCount}/${this.MAX_RETRIES} failed. Retrying in ${delay}ms...`,
        );
        await this.sleep(delay);
        delay = Math.min(delay * 2, 30000); // Exponential backoff, max 30s
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
