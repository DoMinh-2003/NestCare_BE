import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity()
export class Slot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  // @Column({ type: 'int' })
  // duration: number; // Duration in minutes

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @OneToMany(() => Appointment, (appointment) => appointment.slot)
  appointments: Appointment[]; // Thêm mối quan hệ với Appointment
} 