import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private isConnecting = false;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    super();
    console.log('PRISMA ENV URL =', process.env.DATABASE_URL);
    // Start connection in background without blocking
    this.connectInBackground();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  private connectInBackground(): void {
    if (this.isConnecting) return;
    this.isConnecting = true;

    this.connectionPromise = this.connectWithRetry().catch((error) => {
      this.logger.error('❌ Background database connection failed', error.message);
      this.isConnecting = false;
    });
  }

  private async connectWithRetry(): Promise<void> {
    const MAX_RETRIES = 30;
    const INITIAL_RETRY_DELAY = 2000; // 2 seconds
    let retryCount = 0;
    let delay = INITIAL_RETRY_DELAY;

    while (retryCount < MAX_RETRIES) {
      try {
        await this.$connect();
        this.logger.log('✅ Database connected');
        return;
      } catch (error) {
        retryCount++;
        if (retryCount >= MAX_RETRIES) {
          this.logger.warn(`⏳ Database not ready after ${MAX_RETRIES} attempts, will retry on next query`);
          this.isConnecting = false;
          return;
        }

        this.logger.warn(
          `⏳ Database connection attempt ${retryCount}/${MAX_RETRIES} failed. Retrying in ${delay}ms...`,
        );
        await this.sleep(delay);
        delay = Math.min(delay * 2, 30000); // Exponential backoff, max 30s
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async ensureConnected(): Promise<void> {
    if (this.connectionPromise) {
      await this.connectionPromise;
    }
    if (!this.isConnecting) {
      await this.connectWithRetry();
    }
  }
}
