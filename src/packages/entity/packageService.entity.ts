import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Packages } from './package.entity';
import { Services } from 'src/services/services.entity';

@Entity()
export class PackageService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Packages, (packageEntity) => packageEntity.packageServices)
  @JoinColumn({ name: 'package_id' })
  package: Packages; // Mối quan hệ với bảng Packages

  @ManyToOne(() => Services, (service) => service.packageServices)
  @JoinColumn({ name: 'service_id' })
  service: Services; // Mối quan hệ với bảng Services

  @Column({ type: 'int', default: 0 })
  slot: number; // Cột lưu trữ số lượt dịch vụ trong gói
}
