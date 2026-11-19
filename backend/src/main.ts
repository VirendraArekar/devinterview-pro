import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('DevInterviewProBackend');
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: (origin, callback) => {
      // Allow local development ports, preview ports, and env client url
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('DevInterview Pro API')
    .setDescription(
      'Enterprise Full-Stack Developer Interview Preparation Platform REST API (Java, Spring Boot, React, Node.js, System Design, DSA)',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 DevInterview Pro Backend running on http://localhost:${port}`);
  logger.log(`📚 Swagger OpenAPI documentation available at http://localhost:${port}/api/docs`);

  // Auto-seed initial data if database is empty
  try {
    const { runSeeds } = await import('./database/seeds/run-seeds');
    await runSeeds();
  } catch (seedErr) {
    logger.warn(`Auto-seeding check notice: ${seedErr.message}`);
  }
}

bootstrap();
