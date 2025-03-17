import { FetalRecord } from 'src/fetal-records/entities/fetal-record.entity';
import { User } from 'src/users/model/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CheckupRecord } from './checkupRecord.entity';
import {AppointmentServiceEntity } from './appointmentService.entity';

export enum AppointmentStatus {
  PENDING = 'PENDING', // Đang chờ xác nhận
  CONFIRMED = 'CONFIRMED', // Đã xác nhận
  CHECKED_IN = 'CHECKED_IN', // Bệnh nhân đã đến bệnh viện
  IN_PROGRESS = 'IN_PROGRESS', // Đang được khám
  COMPLETED = 'COMPLETED', // Đã hoàn tất
  CANCELED = 'CANCELED', // Đã hủy
}

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FetalRecord, (fetalRecord) => fetalRecord.appointments)
  fetalRecord: FetalRecord;

  @ManyToOne(() => User, (doctor) => doctor.appointments)
  doctor: User;

  @Column({ type: 'timestamp' })
  appointmentDate: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @OneToMany(() => CheckupRecord, (checkupRecord) => checkupRecord.appointment)
  checkupRecords: CheckupRecord[];

  @OneToMany(
    () => AppointmentServiceEntity,
    (appointmentService) => appointmentService.appointment,
  )
  appointmentServices: AppointmentServiceEntity[];

  @Column({ type: 'boolean', default: false })
  isFollow: boolean;
}
