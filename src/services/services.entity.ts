import { AppointmentServiceEntity } from 'src/appointment/entities/appointmentService.entity';
import { PackageService } from 'src/packages/entity/packageService.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Services {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  description: string;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PackageService, (packageService) => packageService.service)
  packageServices: PackageService[];

  @OneToMany(
    () => AppointmentServiceEntity,
    (appointmentService) => appointmentService.service,
  )
  appointmentServices: AppointmentServiceEntity[];
}
