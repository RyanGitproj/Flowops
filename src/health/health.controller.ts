import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';

@Controller('health')
export class HealthController {
  private redisClient: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    // Support both REDIS_URL (Render) and REDIS_HOST/REDIS_PORT (local)
    const redisUrl = this.config.get('REDIS_URL');
    if (redisUrl) {
      this.redisClient = new Redis(redisUrl);
    } else {
      this.redisClient = new Redis({
        host: this.config.get('REDIS_HOST', 'localhost'),
        port: parseInt(this.config.get('REDIS_PORT', '6379'), 10),
      });
    }

    // Suppress Redis connection errors (Redis is optional)
    this.redisClient.on('error', (err) => {
      // Silently ignore Redis errors - connection is optional
    });
  }

  @Get()
  async check() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        api: 'ok',
        database: 'unknown',
        redis: 'unknown',
      },
    };

    // Check PostgreSQL connection
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      health.services.database = 'ok';
    } catch (error) {
      health.services.database = 'error';
      health.status = 'error';
    }

    // Check Redis connection
    try {
      await this.redisClient.ping();
      health.services.redis = 'ok';
    } catch (error) {
      health.services.redis = 'error';
      health.status = 'error';
    }

    // Return appropriate HTTP status code
    const statusCode = health.status === 'ok' ? 200 : 503;
    
    return {
      ...health,
      statusCode,
    };
  }
}
