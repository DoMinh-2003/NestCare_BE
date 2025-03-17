import { Module } from '@nestjs/common';
import { FetalRecordsService } from './fetal-records.service';
import { FetalRecordsController } from './fetal-records.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FetalRecord } from './entities/fetal-record.entity';
import { User } from 'src/users/model/user.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Module({
   imports: [TypeOrmModule.forFeature([FetalRecord,User])],
  controllers: [FetalRecordsController],
  providers: [FetalRecordsService],
})
export class FetalRecordsModule {}
