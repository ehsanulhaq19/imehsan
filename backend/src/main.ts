import { mkdirSync } from 'fs';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
  mkdirSync(uploadDir, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  /**
   * Uploaded files must stay at `/uploads/*` (URLs stored in DB as `/uploads/...`).
   * `setGlobalPrefix('api')` would otherwise expect `/api/uploads/*` and break clients.
   */
  app.useStaticAssets(uploadDir, { prefix: '/uploads/' });
  app.setGlobalPrefix('api', {
    exclude: ['uploads/:filename'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.enableCors({ origin: true });

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
}

bootstrap();
