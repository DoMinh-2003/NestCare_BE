import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeekCheckupService } from './weekCheckup.service';
import { WeekCheckupController } from './weekCheckup.controller';
import { MailService } from 'src/common/service/mail.service';
import { FetalRecord } from 'src/fetal-records/entities/fetal-record.entity';
import { WeekCheckupServiceEntity } from './entities/WeekCheckupService.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { CheckupRecord } from 'src/appointment/entities/checkupRecord.entity';
import { UserPackageServiceUsage } from 'src/users/model/userPackageServiceUsage.entity';
import { Services } from 'src/services/services.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FetalRecord,Services, WeekCheckupServiceEntity,Appointment,CheckupRecord, UserPackageServiceUsage])],
  providers: [WeekCheckupService, MailService],
  controllers: [WeekCheckupController],
})
export class WeekCheckupModule {}
