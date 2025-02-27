import { Module } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { Packages } from './package.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Packages])],

  controllers: [PackagesController],
  providers: [PackagesService],
})
export class PackagesModule {}
