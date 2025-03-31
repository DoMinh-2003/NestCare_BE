import { FetalRecord } from 'src/fetal-records/entities/fetal-record.entity';
import { User } from 'src/users/model/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CheckupRecord } from './checkupRecord.entity';
import { AppointmentServiceEntity } from './appointmentService.entity';
import { MedicationBill } from './medicationBill.entity';
import { AppointmentHistory } from './appointmentHistory.entity';
import { Slot } from 'src/slots/entities/slot.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { ServiceBilling } from './service-billing.entity';

export enum AppointmentStatus {
  AWAITING_DEPOSIT = 'AWAITING_DEPOSIT', // Đang chờ đặt cọc
  PENDING = 'PENDING', // Đang chờ xác nhận
  // CONFIRMED = 'CONFIRMED', // Đã xác nhận
  CHECKED_IN = 'CHECKED_IN', // Bệnh nhân đã đến bệnh viện
  IN_PROGRESS = 'IN_PROGRESS', // Đang được khám
  COMPLETED = 'COMPLETED', // Đã hoàn tất
  CANCELED = 'CANCELED', // Đã hủy
  FAIL = 'FAIL', // 
  NO_SHOW = 'NO_SHOW', // Bệnh nhân không đến
  REFUNDED = 'REFUNDED', // Đã hoàn tiền
  DEPOSIT_FAILED = 'DEPOSIT_FAILED', // Đặt cọc thất bại
  PAYMENT_FAILED = 'PAYMENT_FAILED', // Thanh toán dịch vụ thất bại
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => FetalRecord, (fetalRecord) => fetalRecord.appointments)
  @JoinTable({ name: 'appointment_fetal_records' })
  fetalRecords: FetalRecord[];

  @ManyToOne(() => User, (doctor) => doctor.appointments)
  doctor: User;

  @Column({ type: 'date' })
  appointmentDate: Date;


  @ManyToOne(() => Slot, (slot) => slot.appointments,{ eager: true })
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

  // @OneToMany(
  //   () => AppointmentServiceEntity,
  //   (appointmentService) => appointmentService.appointment,
  // )
  // appointmentServices: AppointmentServiceEntity[];

  @OneToMany(() => MedicationBill, (bill) => bill.appointment, {
    cascade: true,
  })
  medicationBills: MedicationBill[];

  @OneToMany(() => Transaction, (transaction) => transaction.appointment)
  transactions: Transaction[];


  @OneToOne(() => ServiceBilling, (serviceBilling) => serviceBilling.appointment)
  serviceBilling: ServiceBilling; // Thêm mối quan hệ OneToOne với ServiceBilling

  // @Column({ type: 'boolean', default: false })
  // isFollow: boolean;
    @CreateDateColumn()
    createdAt: Date;
}
