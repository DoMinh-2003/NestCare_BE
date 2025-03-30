import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPackagesService } from './userPackages.service';
import { UserPackagesController } from './userPackages.controller';
import { UserPackages } from './entities/userPackages.entity';
import { Packages } from 'src/packages/entity/package.entity';
import { User } from 'src/users/model/user.entity';
import { VnpayService } from 'src/common/service/vnpay.service';
import { UserPackageServiceUsage } from 'src/users/model/userPackageServiceUsage.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([UserPackageServiceUsage, UserPackages, Packages , User, UserPackageServiceUsage]),
  ],
  controllers: [UserPackagesController],
  providers: [UserPackagesService, VnpayService],
})
export class UserPackagesModule {}
