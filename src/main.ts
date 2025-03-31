import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerConfig } from './config/swagger.config';
import { initializeFirebaseAdmin } from './config/firebase.config';
import { ConfigService } from '@nestjs/config';
import { CustomExceptionFilter } from './common/exceptions';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as https from 'https';
import * as fs from 'fs';

async function bootstrap() {
  // Lấy instance của ConfigService
  const app = await NestFactory.create(AppModule);
  
  // Inject ConfigService để lấy giá trị môi trường
  const configService = app.get(ConfigService);
  const environment = configService.get('NODE_ENV'); // Dùng configService để gọi 'get'

  // Chỉ thiết lập httpsOptions nếu môi trường là production
  const httpsOptions = environment === 'production' ? {
    key: fs.readFileSync('/etc/letsencrypt/live/nestcare.site/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/nestcare.site/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/nestcare.site/chain.pem'),
  } : null; // Không sử dụng HTTPS nếu không phải môi trường production

  // Nếu sử dụng httpsOptions, tạo ứng dụng với HTTPS
  const appInstance = httpsOptions 
    ? await NestFactory.create(AppModule, { httpsOptions })
    : await NestFactory.create(AppModule);

  appInstance.enableCors();
  appInstance.useGlobalFilters(new CustomExceptionFilter());
  SwaggerConfig.setupSwagger(appInstance);
  
  // Khởi tạo Firebase
  initializeFirebaseAdmin(configService);

  // Lắng nghe trên port
  await appInstance.listen(process.env.PORT ?? 3000);
}
bootstrap();
