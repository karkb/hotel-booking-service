import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { BullBoardService } from './queue/bullboard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors();

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Mount Bull Board UI
  const bullBoardService = app.get(BullBoardService);
  app.use('/admin/queues/ui', bullBoardService.getRouter());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Hotel Booking API')
    .setDescription('Backend system for hotel booking with vendor integration')
    .setVersion('1.0')
    .addTag('Bookings')
    .addTag('Queue Monitoring')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  console.log(`📊 Queue monitoring: http://localhost:${port}/admin/queues/ui`);
}

bootstrap();
