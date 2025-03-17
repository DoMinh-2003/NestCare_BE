import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guard/roles.guard';
import { AuthGuard } from './auth/guard/auth.guard';
// import { BlogsModule } from './blog/blog.module';
// import { CategoryModule } from './category/category.module';
import { MedicationModule } from './medication/medication.module';
import { ServicesModule } from './services/services.module';
import { PackagesModule } from './packages/packages.module';
import { FetalRecordsModule } from './fetal-records/fetal-records.module';
import { UserPackagesModule } from './userPackages/userPackages.module';
import { AppointmentModule } from './appointment/appointment.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MedicationModule,
    // BlogsModule,
    // CategoryModule,
    ServicesModule,
    AppointmentModule,


    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),


    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', // SMTP server
        port: 587,
        secure: false, // true cho cổng 465, false cho 587
        auth: {
          user: 'minhlola28@gmail.com', // Thay bằng email của bạn
          pass: 'nusfpougsykpemtb', // Mật khẩu ứng dụng (App Password)
        },
      },
      defaults: {
        from: 'minhlola28@gmail.com', // Email gửi đi
      },
      template: {
        dir: join(__dirname, 'templates'), // Thư mục chứa template email
        adapter: new HandlebarsAdapter(), // Sử dụng Handlebars
        options: { strict: true },
      },
    }),

    PackagesModule,
    FetalRecordsModule,
    UserPackagesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
