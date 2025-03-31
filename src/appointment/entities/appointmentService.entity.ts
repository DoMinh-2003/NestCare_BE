import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Appointment } from './appointment.entity';
import { Services } from 'src/services/services.entity';
import { ServiceBilling } from './service-billing.entity';

@Entity('appointment_services')
export class AppointmentServiceEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @ManyToOne(() => Appointment, (appointment) => appointment.appointmentServices, { onDelete: 'CASCADE' })
  // appointment: Appointment;

  @ManyToOne(() => Services, (service) => service.appointmentServices, { onDelete: 'CASCADE', eager: true  })
  service: Services;

  @ManyToOne(() => ServiceBilling, (serviceBilling) => serviceBilling.appointmentServices, { onDelete: 'CASCADE' })
  serviceBilling: ServiceBilling;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number; // Giá dịch vụ tại thời điểm khám

  @Column()
  isInPackage: boolean;

  @Column({ nullable: true })
  notes?: string; // Ghi chú nếu cần


}
