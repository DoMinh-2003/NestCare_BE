import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerConfig } from './config/swagger.config';
import { initializeFirebaseAdmin } from './config/firebase.config';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  SwaggerConfig.setupSwagger(app);
  initializeFirebaseAdmin(app.get(ConfigService));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
