import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentController } from './appointment.controller';
import { Appointment } from './entities/appointment.entity';
import { FetalRecord } from 'src/fetal-records/entities/fetal-record.entity';
import { User } from 'src/users/model/user.entity';
import { CheckupRecord } from './entities/checkupRecord.entity';
import { Services } from 'src/services/services.entity';
import { AppointmentServiceEntity } from './entities/appointmentService.entity';
import { AppointmentService } from './appointment.service';
import { UserPackages } from 'src/userPackages/entities/userPackages.entity';
import { PackageService } from 'src/packages/entity/packageService.entity';
import { VnpayService } from 'src/common/service/vnpay.service';
import { MailService } from 'src/common/service/mail.service';
import { MedicationBillDetail } from './entities/medicationBillDetail.entity';
import { MedicationBill } from './entities/medicationBill.entity';
import { Medication } from 'src/medication/medication.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Appointment, FetalRecord, Medication, User, CheckupRecord, AppointmentServiceEntity, UserPackages, PackageService, Services, MedicationBillDetail, MedicationBill])],
  controllers: [AppointmentController],
  providers: [AppointmentService,VnpayService,MailService],
})
export class AppointmentModule {}
