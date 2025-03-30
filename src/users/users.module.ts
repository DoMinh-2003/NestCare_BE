import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './model/user.entity';
import { Services } from 'src/services/services.entity';
import { UserPackageServiceUsage } from './model/userPackageServiceUsage.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { UserPackages } from 'src/userPackages/entities/userPackages.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment,UserPackages, User, Services, UserPackageServiceUsage])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [
    UsersService,
    TypeOrmModule.forFeature([User]),
  ],
})
export class UsersModule { }

