import { Module } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { Packages } from './entity/package.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackageService } from './entity/packageService.entity';
import { Services } from 'src/services/services.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Packages, PackageService, Services])],
  controllers: [PackagesController],
  providers: [PackagesService],
})
export class PackagesModule {}
