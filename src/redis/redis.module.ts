import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const REDIS_CONFIG = 'REDIS_CONFIG';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CONFIG,
      useFactory: (config: ConfigService) => {
        // Support both REDIS_URL (Render) and REDIS_HOST/REDIS_PORT (local)
        const redisUrl = config.get('REDIS_URL');
        if (redisUrl) {
          // Parse REDIS_URL format: redis://host:port
          const url = new URL(redisUrl);
          return {
            host: url.hostname,
            port: parseInt(url.port, 10) || 6379,
          };
        }
        // Fallback to individual env vars
        return {
          host: config.get('REDIS_HOST', 'localhost'),
          port: parseInt(config.get('REDIS_PORT', '6379'), 10),
        };
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CONFIG],
})
export class RedisModule {}
