import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── Health check endpoint (root level for Render) ────────────────
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // ─── Global prefix ─────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── Validation ────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ─── Swagger ───────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('FlowOps API')
    .setDescription(
      '⚡ FlowOps – Event-driven backend automation system\n\n' +
        'Architecture: NestJS · PostgreSQL · Redis · BullMQ\n\n' +
        '**Auth:** Use `/api/v1/auth/register` then `/api/v1/auth/login`, ' +
        'copy the token and click "Authorize" 🔐',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Register & login')
    .addTag('Events', 'Publish business events')
    .addTag('Logs', 'Event processing logs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n🚀 FlowOps API running at: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger docs:           http://localhost:${port}/docs\n`);
}

bootstrap();
