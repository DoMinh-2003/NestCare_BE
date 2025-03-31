import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, JoinColumn } from 'typeorm';
import { AppointmentStatus,Appointment } from './appointment.entity';
import { User } from 'src/users/model/user.entity';


export enum AppointmentHistoryStatus {
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

@Entity()
export class AppointmentHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Appointment, (appointment) => appointment.history)
  appointment: Appointment;

  @Column({
    type: 'enum',
    enum: AppointmentHistoryStatus,
  })
  status: AppointmentHistoryStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changedByUserId' }) // Specify the foreign key column
  changedBy: User;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
} 