import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './model/user.entity';
import { Services } from 'src/services/services.entity';
import { UserPackageServiceUsage } from './model/userPackageServiceUsage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,Services,UserPackageServiceUsage])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
