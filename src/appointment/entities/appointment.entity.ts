import { FetalRecord } from 'src/fetal-records/entities/fetal-record.entity';
import { User } from 'src/users/model/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CheckupRecord } from './checkupRecord.entity';
import { AppointmentServiceEntity } from './appointmentService.entity';
import { MedicationBill } from './medicationBill.entity';
import { AppointmentHistory } from './appointmentHistory.entity';
import { Slot } from 'src/slots/entities/slot.entity';

export enum AppointmentStatus {
  PENDING = 'PENDING', // Đang chờ xác nhận
  CONFIRMED = 'CONFIRMED', // Đã xác nhận
  CHECKED_IN = 'CHECKED_IN', // Bệnh nhân đã đến bệnh viện
  IN_PROGRESS = 'IN_PROGRESS', // Đang được khám
  COMPLETED = 'COMPLETED', // Đã hoàn tất
  CANCELED = 'CANCELED', // Đã hủy
  FAIL = 'FAIL', // 
}

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => FetalRecord, (fetalRecord) => fetalRecord.appointments)
  @JoinTable()
  fetalRecords: FetalRecord[];

  @ManyToOne(() => User, (doctor) => doctor.appointments)
  doctor: User;

  @Column({ type: 'date' })
  appointmentDate: Date;


  @ManyToOne(() => Slot, (slot) => slot.appointments)
  slot: Slot; // Thêm mối quan hệ với Slot

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @OneToMany(() => CheckupRecord, (checkupRecord) => checkupRecord.appointment)
  checkupRecords: CheckupRecord[];

  @OneToMany(() => AppointmentHistory, (appointmentHistory) => appointmentHistory.appointment)
  history: AppointmentHistory[];

  @OneToMany(
    () => AppointmentServiceEntity,
    (appointmentService) => appointmentService.appointment,
  )
  appointmentServices: AppointmentServiceEntity[];

  @OneToMany(() => MedicationBill, (bill) => bill.appointment, {
    cascade: true,
  })
  medicationBills: MedicationBill[];

  // @Column({ type: 'boolean', default: false })
  // isFollow: boolean;
}
