import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerConfig } from './config/swagger.config';
import { initializeFirebaseAdmin } from './config/firebase.config';
import { ConfigService } from '@nestjs/config';
import { CustomExceptionFilter } from './common/exceptions';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalFilters(new CustomExceptionFilter());
  SwaggerConfig.setupSwagger(app);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  initializeFirebaseAdmin(app.get(ConfigService));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
