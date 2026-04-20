import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const REDIS_CONFIG = 'REDIS_CONFIG';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CONFIG,
      useFactory: (config: ConfigService) => ({
        host: config.get('REDIS_HOST', 'localhost'),
        port: parseInt(config.get('REDIS_PORT', '6379'), 10),
      }),
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CONFIG],
})
export class RedisModule {}
