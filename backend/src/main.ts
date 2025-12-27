import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true }
    })
  );

  const corsOrigins = configService.get<string>('CORS_ORIGINS') || '';
  app.enableCors({
    origin: corsOrigins.split(',').map((value) => value.trim()).filter(Boolean),
    credentials: true
  });

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
}

bootstrap();
