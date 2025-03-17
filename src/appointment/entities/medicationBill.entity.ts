import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, Column, CreateDateColumn } from 'typeorm';
import { Appointment } from './appointment.entity';
import { MedicationBillDetail } from './medicationBillDetail.entity';

@Entity()
export class MedicationBill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Appointment, (appointment) => appointment.medicationBills, { onDelete: 'CASCADE' })
  appointment: Appointment;

  @OneToMany(() => MedicationBillDetail, (detail) => detail.bill, { cascade: true })
  details: MedicationBillDetail[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @CreateDateColumn()
  createdAt: Date;
}
