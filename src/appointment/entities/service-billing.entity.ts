// src/appointments/entities/service-billing.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    OneToMany,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    
  } from 'typeorm';
  import { Appointment } from './appointment.entity';
  import { AppointmentServiceEntity } from './appointmentService.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
  
  @Entity('service_billings')
  export class ServiceBilling {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @OneToOne(() => Appointment, (appointment) => appointment.serviceBilling, {
      onDelete: 'CASCADE',
    })
    @JoinColumn()
    appointment: Appointment;
  
    @OneToMany(
      () => AppointmentServiceEntity,
      (appointmentService) => appointmentService.serviceBilling,
    )
    appointmentServices: AppointmentServiceEntity[];
  
    @OneToMany(() => Transaction, (transaction) => transaction.serviceBilling)
    transactions: Transaction[];
  
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalAmount: number; // Tổng tiền trước giảm giá
  
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    discountAmount: number; // Tổng tiền giảm giá (ví dụ: từ tiền cọc)
  
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    finalAmount: number; // Tổng tiền sau giảm giá cần thanh toán
  
    @Column({ type: 'enum', enum: ['PENDING', 'PARTIAL', 'PAID', 'REFUNDED'], default: 'PENDING' })
    paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }